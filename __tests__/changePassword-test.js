import React from 'react';
import { Alert, BackHandler } from 'react-native';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Actions } from 'react-native-router-flux';
import { iOSColors } from 'react-native-typography';
import ChangePassword from '../ChangePassword';
import DbManager from '../../app/DBManager';

configure({ adapter: new Adapter() });
const onConfirmServer = jest.fn();
DbManager.app.logout = jest.fn();
DbManager.app.resetPassword = jest.fn();

jest.mock('react-native-router-flux', () => ({
  Actions: {
    pop: jest.fn(),
    Login: jest.fn(),
  },
}));

jest.mock('BackHandler', () => {
  const backHandler = {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
  return backHandler;
});

jest.mock('Alert', () => {
  const alert = {
    alert: jest.fn(),
  };
  return alert;
});

jest.mock('../../app/DBManager', () => {
  const dbManager = {
    app: {},
    user: {},
  };
  return dbManager;
});

it('render correctly with props', () => {
  const tree = renderer.create(<ChangePassword onConfirmServer={onConfirmServer} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('should render the onChange to input newPassword', () => {
  const rootComponent = shallow(<ChangePassword />);
  const authorInputComponent = rootComponent.find('TextInput').first();

  authorInputComponent.simulate('ChangeText', 'text');
  expect(rootComponent.state('newPassword')).toEqual('text');
});

it('should render the onChange to input confirmPassword', () => {
  const rootComponent = shallow(<ChangePassword />);
  const authorInputComponent = rootComponent.find('TextInput').last();

  authorInputComponent.simulate('ChangeText', 'text');
  expect(rootComponent.state('confirmPassword')).toEqual('text');
});

it('confirm button is clicked', () => {
  const rootComponent = shallow(<ChangePassword />);
  const instance = rootComponent.instance();
  instance.updatePassword = jest.fn();

  const button = rootComponent.find('Button').first();
  button.props().onPress();
  expect(instance.updatePassword.mock.calls.length).toEqual(1);
});

it('ChangePassword unmounts correctly', () => {
  const tree = shallow(<ChangePassword />);
  tree.unmount();
  expect(BackHandler.addEventListener).toHaveBeenCalled();
});

it('resetCallBack', () => {
  const rootComponent = shallow(<ChangePassword />);
  const instance = rootComponent.instance();
  const result = true;
  const reason = 'test reason';

  instance.resetCallBack(result, reason);
  expect(DbManager.app.logout.mock.calls.length).toEqual(1);
  expect(Actions.Login.mock.calls.length).toEqual(1);
});

it('else resetCallBack', () => {
  const rootComponent = shallow(<ChangePassword />);
  const instance = rootComponent.instance();
  const result = false;
  const reason = false;
  instance.resetCallBack(result, reason);
  expect(Alert.alert).toHaveBeenCalledWith(reason);
});

it('updatePassword', () => {
  const rootComponent = shallow(<ChangePassword />);
  const instance = rootComponent.instance();
  const newPassword = true;
  const confirmPassword = 'test confirmPassword';

  instance.updatePassword(newPassword, confirmPassword);
  expect(Actions.Login.mock.calls.length).toEqual(1);
});

it('else updatePassword', () => {
  const rootComponent = shallow(<ChangePassword />);
  const instance = rootComponent.instance();
  const newPassword = true;
  const confirmPassword = true;

  instance.updatePassword(newPassword, confirmPassword);
  expect(DbManager.app.resetPassword.mock.calls.length).toEqual(1);
});

it('handleBackPress', () => {
  const rootComponent = shallow(<ChangePassword />);
  const instance = rootComponent.instance();
  const result = instance.handleBackPress();

  expect(result).toBe(true);
  expect(Actions.Login.mock.calls.length).toBe(1);
});
