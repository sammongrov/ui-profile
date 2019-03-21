import React from 'react';
import renderer from 'react-test-renderer';
import { shallow, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
// import { Actions } from 'react-native-router-flux';
import { iOSColors } from 'react-native-typography';
import MemberInfo from '../MemberInfo';
import DbManager from '../../app/DBManager';

configure({ adapter: new Adapter() });
// jest.mock('react-native-router-flux', () => ({
//   Actions: { pop: jest.fn() },
// }));

jest.mock('../../app/DBManager', () => {
  const dbManager = {
    app: {},
    user: {},
    group: {},
    _taskManager: {},
  };
  return dbManager;
});

jest.spyOn(Date, 'now').mockImplementation(() => 1479427200000);

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
  '0': { _id: 'XNN1986P1', username: 'NewUser', name: 'Four' },
  '1': { _id: 'XPP89611P', username: 'divergent', name: 'Trix' },
};

const user = {
  _id: 'XNN1986P1',
  username: 'NewUser',
  name: 'Four',
  emails: 'four@mongrov.com',
  status: 'busy',
  avatar: '4',
};

DbManager.user.findById = jest.fn(() => user);
DbManager.group.findById = jest.fn(() => groupInfo);
DbManager._taskManager.chat = { getGroupUsers: jest.fn(() => users) };
DbManager.app.app = { host: 'test.mongrov.com' };

// Snapshots

it('Member Info renders correctly with memberId only', () => {
  const tree = renderer.create(<MemberInfo memberId="7X856YIks9" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Member Info renders correctly eachmemberId only', () => {
  const tree = renderer.create(<MemberInfo eachmemberId="XNN1986P1" />).toJSON();
  expect(tree).toMatchSnapshot();
});

it('Member Info unmounts correctly', () => {
  const tree = renderer.create(<MemberInfo eachmemberId="XNN1986P1" />);
  const treeInstance = tree.getInstance();
  tree.unmount();
  expect(treeInstance._isMounted).toBe(false);
});

// Component functions
it('getUserMember method is called', () => {
  const tree = renderer.create(<MemberInfo memberId="7X856YIks9" />);
  const treeInstance = tree.getInstance();
  const result = treeInstance.getUserMember(groupInfo, users);
  expect(result).toEqual(users['0']);
});

describe('getProfileTitle method is called', () => {
  it('title from user.name', () => {
    const tree = renderer.create(<MemberInfo memberId="7X856YIks9" />);
    const treeInstance = tree.getInstance();
    const result = treeInstance.getProfileTitle(users['0'], groupInfo);
    expect(result).toMatch(users['0'].name);
  });

  it('title from user.username', () => {
    const tree = renderer.create(<MemberInfo memberId="7X856YIks9" />);
    const testUser = { _id: 'XNN1986P1', username: 'NewUser' };
    const treeInstance = tree.getInstance();
    const result = treeInstance.getProfileTitle(testUser, {});
    expect(result).toMatch(testUser.username);
  });

  it('title from group', () => {
    const tree = renderer.create(<MemberInfo memberId="7X856YIks9" />);
    const treeInstance = tree.getInstance();
    const result = treeInstance.getProfileTitle({}, groupInfo);
    expect(result).toMatch(groupInfo.title);
  });

  it('no title', () => {
    const tree = renderer.create(<MemberInfo memberId="7X856YIks9" />);
    const testGroup = { _id: '7X856YIks9', name: 'NewUser' };
    const treeInstance = tree.getInstance();
    const result = treeInstance.getProfileTitle({}, testGroup);
    expect(result).toMatch('');
  });
});

describe('fetchGroupMembers method is called', () => {
  it('component is not mounted', async () => {
    const tree = renderer.create(<MemberInfo memberId="7X856YIks9" />);
    const treeInstance = tree.getInstance();
    treeInstance._isMounted = false;
    await treeInstance.fetchGroupMembers();
    expect.assertions(2);
    expect(DbManager._taskManager.chat.getGroupUsers).toBeCalled();
    expect(treeInstance.state.members).toEqual([]);
  });

  it('component is mounted', async () => {
    const tree = shallow(<MemberInfo memberId="7X856YIks9" />);
    const treeInstance = tree.instance();
    treeInstance._isMounted = true;
    await treeInstance.fetchGroupMembers();
    expect.assertions(3);
    expect(DbManager._taskManager.chat.getGroupUsers).toBeCalled();
    expect(treeInstance._isMounted).toBe(true);
    expect(tree.state().members).toEqual(users);
  });
});

describe('updateUserDetails method is called', () => {
  it('user details received', () => {
    const tree = renderer.create(<MemberInfo eachmemberId="XNN1986P1" />);
    const treeInstance = tree.getInstance();
    treeInstance.updateUSerDetails();
    expect(DbManager.user.findById).toBeCalled();
    expect(treeInstance.state.memberObj).toEqual(user);
  });

  it('user details is null', () => {
    DbManager.user.findById = jest.fn(() => null);
    const tree = renderer.create(<MemberInfo eachmemberId="XNN1986P1" />);
    const treeInstance = tree.getInstance();
    treeInstance.updateUSerDetails();
    expect(DbManager.user.findById).toBeCalled();
    expect(treeInstance.state.memberObj).toEqual({});
  });

  it('gets error', () => {
    DbManager.user.findById = jest.fn(() => {
      throw new Error('user details error');
    });
    const tree = renderer.create(<MemberInfo eachmemberId="XNN1986P1" />);
    const treeInstance = tree.getInstance();
    treeInstance.updateUSerDetails();
    expect(DbManager.user.findById).toBeCalled();
    expect(treeInstance.state.memberObj).toEqual({});
  });

  it('no eachmemberId prop', () => {
    DbManager.user.findById = jest.fn(() => user);
    const tree = renderer.create(<MemberInfo memberId="7X856YIks9" />);
    const treeInstance = tree.getInstance();
    treeInstance.updateUSerDetails();
    expect(DbManager.user.findById).not.toBeCalled();
    expect(treeInstance.state.memberObj).toEqual({});
  });
});

// Render

describe('render with different user status', () => {
  it('user is online', () => {
    const groupUsers = {
      '0': {
        _id: 'XNN1986P1',
        username: 'NewUser',
        name: 'Four',
        status: 'online',
      },
      '1': { _id: 'XPP89611P', username: 'divergent', name: 'Trix' },
    };
    const tree = shallow(<MemberInfo memberId="7X856YIks9" />);
    tree.setState({ members: groupUsers });
    expect(
      tree
        .find('Profile')
        .first()
        .props().statusColor,
    ).toMatch(iOSColors.green);
  });

  it('user is away', () => {
    const groupUsers = {
      '0': {
        _id: 'XNN1986P1',
        username: 'NewUser',
        name: 'Four',
        status: 'away',
      },
      '1': { _id: 'XPP89611P', username: 'divergent', name: 'Trix' },
    };
    const tree = shallow(<MemberInfo memberId="7X856YIks9" />);
    tree.setState({ members: groupUsers });
    expect(
      tree
        .find('Profile')
        .first()
        .props().statusColor,
    ).toMatch(iOSColors.yellow);
  });

  it('user is busy', () => {
    const groupUsers = {
      '0': {
        _id: 'XNN1986P1',
        username: 'NewUser',
        name: 'Four',
        status: 'busy',
      },
      '1': { _id: 'XPP89611P', username: 'divergent', name: 'Trix' },
    };
    const tree = shallow(<MemberInfo memberId="7X856YIks9" />);
    tree.setState({ members: groupUsers });
    expect(
      tree
        .find('Profile')
        .first()
        .props().statusColor,
    ).toMatch(iOSColors.red);
  });

  it('user is online - from eachmemberId prop', () => {
    const userObj = {
      _id: 'XNN1986P1',
      username: 'NewUser',
      name: 'Four',
      emails: 'four@mongrov.com',
      status: 'online',
      avatar: '4',
    };
    const tree = shallow(<MemberInfo eachmemberId="XNN1986P1" />);
    tree.setState({ memberObj: userObj });
    expect(
      tree
        .find('Profile')
        .first()
        .props().statusColor,
    ).toMatch(iOSColors.green);
  });

  it('user is away - from eachmemberId prop', () => {
    const userObj = {
      _id: 'XNN1986P1',
      username: 'NewUser',
      name: 'Four',
      emails: 'four@mongrov.com',
      status: 'away',
      avatar: '4',
    };
    const tree = shallow(<MemberInfo eachmemberId="XNN1986P1" />);
    tree.setState({ memberObj: userObj });
    expect(
      tree
        .find('Profile')
        .first()
        .props().statusColor,
    ).toMatch(iOSColors.yellow);
  });
});

it('Profile onPress', () => {
  const tree = shallow(<MemberInfo eachmemberId="XNN1986P1" />);
  const profile = tree.find('Profile').first();
  profile.props().onPress();
  expect(profile.props().onPress).toBeInstanceOf(Function);
});

it('render without props', () => {
  const tree = shallow(<MemberInfo />);
  expect(tree.find('Screen')).toHaveLength(0);
});
