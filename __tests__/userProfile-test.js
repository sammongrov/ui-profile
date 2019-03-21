import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Actions } from 'react-native-router-flux';
import configureStore from 'redux-mock-store';
import DbManager from '../../app/DBManager';
import UserProfile from '../UserProfile';

configure({ adapter: new Adapter() });

jest.mock('react-native-router-flux', () => ({
  Actions: {
    Login: jest.fn(),
    ChangePasswordScene: jest.fn(),
  },
}));

jest.mock('../../app/DBManager', () => {
  const dbManager = {
    app: {},
    user: {},
  };
  return dbManager;
});

const user = {
  _id: 'XNN1986P1',
  username: 'NewUser',
  name: 'Four',
  emails: 'four@mongrov.com',
  status: 'busy',
  avatar: '4',
  avatarURL: 'https://four.avatar.io',
};

DbManager.app.logout = jest.fn();
DbManager.user.loginUserListner = jest.fn();
DbManager.user.loggedInUser = user;

const initialState = {};
const mockStore = configureStore();

let store;
beforeEach(() => {
  store = mockStore(initialState);
});

// Snapshots

it('UserProfile renders correctly', () => {
  const tree = renderer.create(<UserProfile store={store} />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('UserProfile sets loginUserListener', () => {
  renderer.create(<UserProfile store={store} />);
  expect(DbManager.user.loginUserListner).toBeCalled();
});

describe('UserProfile calls change password', () => {
  it('currentScene is UserProfileScene', () => {
    Actions.currentScene = 'UserProfileScene';
    const tree = shallow(<UserProfile store={store} />).dive();
    const component = tree.instance();
    component.changePassoword();
    expect(Actions.ChangePasswordScene).toBeCalled();
  });

  it('currentScene is not UserProfileScene', () => {
    Actions.currentScene = 'MemberInfoScene';
    Actions.ChangePasswordScene.mockClear();
    const tree = shallow(<UserProfile store={store} />).dive();
    const component = tree.instance();
    component.changePassoword();
    expect(Actions.ChangePasswordScene).not.toBeCalled();
  });
});

describe('UserProfile calls updateUSerDetails ', () => {
  const buildNo = '1601';
  const versionNo = '0.1.61';

  it('gets user details', () => {
    const tree = shallow(
      <UserProfile store={store} buildNo={buildNo} versionNo={versionNo} />,
    ).dive();
    const component = tree.instance();
    component.updateUSerDetails();
    expect(component.state.name).toMatch(user.name);
    expect(component.state.avatar).toMatch(user.avatarURL);
    expect(component.state.profileList.length).toBe(5);
  });

  it('gets no user details', () => {
    DbManager.user.loggedInUser = null;
    const tree = shallow(
      <UserProfile store={store} buildNo={buildNo} versionNo={versionNo} />,
    ).dive();
    const component = tree.instance();
    component.updateUSerDetails();
    expect(component.state.name).toMatch('');
    expect(component.state.avatar).toMatch('');
    expect(component.state.profileList.length).toBe(2);
  });

  it('gets an error', () => {
    const testUser = {
      _id: 'XNN1986P1',
      username: 'NewUser',
      name: 'Four',
      status: 'busy',
      avatar: '4',
      avatarURL: 'https://four.avatar.io',
    };
    DbManager.user.loggedInUser = testUser;
    const error = new Error('test error');
    const tree = shallow(
      <UserProfile store={store} buildNo={buildNo} versionNo={versionNo} />,
    ).dive();
    const component = tree.instance();
    component.setState = jest.fn(() => {
      throw error;
    });
    component.updateUSerDetails();
    expect(component.setState.mock.calls.length).toBe(1);
  });
});

it('onPress on Profile', () => {
  const tree = shallow(<UserProfile store={store} />).dive();
  const profile = tree.find('Profile');
  profile.props().onPress();
  expect(profile.props().onPress).toBeInstanceOf(Function);
});

it('onLogout', () => {
  const buildNo = '1601';
  const versionNo = '0.1.61';
  DbManager.user.loggedInUser = user;
  const wrapper = shallow(<UserProfile store={store} buildNo={buildNo} versionNo={versionNo} />);
  const tree = wrapper.dive();
  const component = tree.instance();
  component.updateUSerDetails();
  tree.update();
  const profileList = tree.find('ProfileList');
  const flatList = profileList
    .shallow()
    .find('FlatList')
    .shallow();
  const data = flatList.props().data[2];
  const logoutButton = shallow(flatList.props().renderItem({ item: data }));
  logoutButton.props().onPress();
  expect(DbManager.app.logout).toBeCalled();
  expect(Actions.Login).toBeCalled();
});
