import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Actions } from 'react-native-router-flux';
import GroupInfo from '../GroupInfo';
import DbManager from '../../app/DBManager';

configure({ adapter: new Adapter() });
jest.mock('react-native-router-flux', () => ({
  Actions: {
    pop: jest.fn(),
    currentScene: 'GroupInfoScene',
    MemberInfo: jest.fn(),
  },
}));

jest.mock('../../app/DBManager', () => {
  const dbManager = {
    app: {},
    user: {},
    group: {},
    _taskManager: {},
  };
  return dbManager;
});

const groupInfo = {
  _id: '7X856YIks9',
  name: 'NewUser',
  title: 'NewUser',
  type: 'd',
  avatar: 'newUser',
  unread: 0,
  status: 'busy',
};

const users = {
  '0': { _id: 'XNN1986P1', username: 'NewUser', name: 'Four', status: 'away' },
  '1': {
    _id: 'XPP89611P',
    username: 'divergent',
    name: 'Trix',
    status: 'online',
  },
};

DbManager.group.findById = jest.fn(() => groupInfo);
DbManager._taskManager.chat = { getGroupUsers: jest.fn(() => users) };
DbManager.app.app = { host: 'test.mongrov.com' };

it('GroupInfo renders correctly with props', () => {
  const tree = renderer.create(<GroupInfo memberId="7X856YIks9" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('GroupInfo unmounts correctly', () => {
  const tree = renderer.create(<GroupInfo memberId="7X856YIks9" />);
  const treeInstance = tree.getInstance();
  tree.unmount();
  expect(treeInstance._isMounted).toBe(false);
});

describe('getOnlineMembers method is called', () => {
  it('with the users object', () => {
    const tree = renderer.create(<GroupInfo memberId="7X856YIks9" />);
    const treeInstance = tree.getInstance();
    const result = treeInstance.getOnlineMembers(users);
    expect(result).toMatch('1');
  });

  it('with not an object', () => {
    const tree = renderer.create(<GroupInfo memberId="7X856YIks9" />);
    const treeInstance = tree.getInstance();
    const result = treeInstance.getOnlineMembers('members');
    expect(result).toMatch('0');
  });
});

describe('fetchGroupMembers method is called', () => {
  it('with isMounted equals true', async () => {
    const tree = shallow(<GroupInfo memberId="7X856YIks9" />);
    const treeInstance = tree.instance();
    treeInstance._isMounted = true;
    treeInstance.createMembersList = jest.fn(() => users);
    expect.assertions(4);
    await treeInstance.fetchGroupMembers();
    expect(DbManager._taskManager.chat.getGroupUsers).toBeCalled();
    expect(treeInstance.createMembersList).toBeCalled();
    expect(treeInstance._isMounted).toBe(true);
    expect(tree.state().members).toEqual(users);
  });

  it('with isMounted equals true', async () => {
    DbManager._taskManager.chat.getGroupUsers.mockClear();
    const tree = shallow(<GroupInfo memberId="7X856YIks9" />);
    const treeInstance = tree.instance();
    treeInstance._isMounted = false;
    treeInstance.createMembersList = jest.fn(() => users);
    expect.assertions(4);
    await treeInstance.fetchGroupMembers();
    expect(DbManager._taskManager.chat.getGroupUsers).toBeCalled();
    expect(treeInstance.createMembersList).not.toBeCalled();
    expect(treeInstance._isMounted).toBe(false);
    expect(tree.state().members).toEqual([]);
  });
});

describe('userprofile method is called', () => {
  it('a current scene is "groupInfoScene"', () => {
    const tree = renderer.create(<GroupInfo memberId="7X856YIks9" />);
    const treeInstance = tree.getInstance();
    treeInstance.userprofile('XPP89611P');
    expect(Actions.MemberInfo).toBeCalled();
  });

  it('with not an object', () => {
    Actions.MemberInfo.mockClear();
    Actions.currentScene = 'MemberInfoScene';
    const tree = renderer.create(<GroupInfo memberId="7X856YIks9" />);
    const treeInstance = tree.getInstance();
    treeInstance.userprofile('XPP89611P');
    expect(Actions.MemberInfo).not.toBeCalled();
  });
});

describe('createMembersList method is called', () => {
  it('with the users object', () => {
    const groupUsers = [
      { _id: 'XNN1986P1', status: 'away', avatarURL: 'https://four.avatar.io' },
      { _id: 'XPP89611P', username: 'divergent', status: 'online' },
    ];
    const tree = renderer.create(<GroupInfo memberId="7X856YIks9" />);
    const treeInstance = tree.getInstance();
    const members = [
      {
        id: 'XNN1986P1',
        title: '',
        status: 'away',
        subTitle: '@undefined',
        avatar_url: 'https://four.avatar.io',
      },
      {
        id: 'XPP89611P',
        title: 'divergent',
        status: 'online',
        subTitle: '@divergent',
        avatar_url: undefined,
      },
    ];
    const result = treeInstance.createMembersList(groupUsers);
    expect(result[0]).toMatchObject(members[0]);
    expect(result[1]).toMatchObject(members[1]);
  });

  it('with not an object', () => {
    const tree = renderer.create(<GroupInfo memberId="7X856YIks9" />);
    const treeInstance = tree.getInstance();
    const result = treeInstance.createMembersList('members');
    expect(result).toEqual([]);
  });
});

it('GroupInfo renders with a description and an announcement', () => {
  const tree = shallow(<GroupInfo memberId="7X856YIks9" />);
  const groupObj = {
    _id: '25X856YIks9',
    // name: 'First jumper',
    description: 'Brave first jumper',
    announcement: 'Let us jump',
    type: 'private',
    avatarURL: 'first-jumper.net',
    unread: 0,
  };
  tree.setState({ groupObj });
  const profile = tree
    .find('Profile')
    .first()
    .props();
  expect(profile.profileTitle).toMatch('');
  expect(profile.profileUname).toMatch(groupObj.description);
  expect(profile.profileAnnouncement).toMatch(groupObj.announcement);
});

// onPress events
it('Profile onPress', () => {
  const tree = shallow(<GroupInfo memberId="7X856YIks9" />);
  const profile = tree.find('Profile').first();
  profile.props().onPress();
  expect(profile.props().onPress).toBeInstanceOf(Function);
});

it('ProfileList onPress', async () => {
  Actions.currentScene = 'GroupInfoScene';
  Actions.MemberInfo.mockClear();
  const tree = shallow(<GroupInfo memberId="7X856YIks9" />);
  const treeInstance = tree.instance();
  treeInstance._isMounted = true;
  await treeInstance.fetchGroupMembers();
  tree.update();
  const profileList = tree.find('ProfileList');
  const flatList = profileList
    .shallow()
    .find('FlatList')
    .shallow();
  const data = flatList.props().data[0];
  const listItem = shallow(flatList.props().renderItem({ item: data }));
  listItem.props().onPress();
  expect.assertions(1);
  expect(Actions.MemberInfo).toHaveBeenCalledTimes(1);
});

it('ProfileList onAvatarPress', async () => {
  Actions.currentScene = 'GroupInfoScene';
  Actions.MemberInfo.mockClear();
  const tree = shallow(<GroupInfo memberId="7X856YIks9" />);
  const treeInstance = tree.instance();
  treeInstance._isMounted = true;
  await treeInstance.fetchGroupMembers();
  tree.update();
  const profileList = tree.find('ProfileList');
  const flatList = profileList
    .shallow()
    .find('FlatList')
    .shallow();
  const data = flatList.props().data[0];
  const listItem = shallow(flatList.props().renderItem({ item: data }));
  const avatar = listItem.find('Avatar');
  avatar.props().onAvatarPress();
  expect.assertions(1);
  expect(Actions.MemberInfo).toHaveBeenCalledTimes(1);
});
