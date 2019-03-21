import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import DbManager from '../../app/DBManager';
import MessageInfo from '../MessageInfo';

configure({ adapter: new Adapter() });

jest.mock('../../app/DBManager', () => {
  const dbManager = {
    _taskManager: {},
  };
  return dbManager;
});

const messageInfo = [
  {
    user: { _id: 'id123456', name: 'user1', username: '1user' },
    ts: 1547884787152,
  },
  {
    user: { _id: 'id123457', name: 'user2', username: '2user' },
    ts: 1547884787052,
  },
  {
    user: { _id: 'id123455', name: 'user3', username: '3user' },
    ts: 1547884786053,
  },
];

DbManager._taskManager.chat = {
  getMessageInfo: jest.fn((id, cb) => cb(null, messageInfo)),
};

it('MessageInfo renders correctly with messageId', () => {
  const tree = renderer.create(<MessageInfo messageId="m985OP253fx" />).toJSON();
  expect(tree).toMatchSnapshot();
});

describe('messageInfo method is called', () => {
  it('with non empty array', () => {
    const tree = shallow(<MessageInfo messageId="m985OP253fx" />);
    const treeInstance = tree.instance();
    treeInstance.messageInfo(null, messageInfo);
    expect(tree.state().memberList.length).toBe(3);
    expect(tree.state().memberList[0].id).toMatch(messageInfo[0].user._id);
    expect(tree.state().memberList[1].title).toMatch(messageInfo[1].user.name);
    expect(tree.state().memberList[2].subTitle).toMatch(`@${messageInfo[2].user.username}`);
  });

  it('with an empty array', () => {
    const tree = shallow(<MessageInfo messageId="m985OP253fx" />);
    const treeInstance = tree.instance();
    treeInstance.messageInfo(null, []);
    expect(tree.state().memberList.length).toBe(0);
  });

  it('with an error', () => {
    const error = new Error('test error');
    const tree = shallow(<MessageInfo messageId="m985OP253fx" />);
    const treeInstance = tree.instance();
    treeInstance.messageInfo(error, []);
    expect(tree.state().memberList.length).toBe(0);
  });
});
