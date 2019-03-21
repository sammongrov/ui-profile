import React, { Component } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '@ui/theme_default';

import { styles } from 'react-native-theme';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { Screen, NavBar, Icon, ProfileList, Profile, QRCodeGenerator } from '@ui/components';
// import DBManager from '../app/DBManager';
import {DBManager} from 'app-module';
// import { Colors } from '@ui/theme_default';

// const styles = StyleSheet.create({});

// const list = [
//   {
//     id: '0',
//     title: 'Peter Paul',
//     subTitle: '@peter',
//     avatar_url: 'https://randomuser.me/api/portraits/men/32.jpg',
//     status: 'online',
//   },
//   {
//     id: '1',
//     title: 'Chris Nolan',
//     subTitle: '@chris',
//     avatar_url:
//       'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-0.3.5&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=200&fit=max&s=707b9c33066bf8808c934c8ab394dff6',
//     status: 'away',
//   },
//   {
//     id: '2',
//     title: 'John Smith',
//     subTitle: '@john',
//     avatar_url: 'https://d3iw72m71ie81c.cloudfront.net/female-17.jpg',
//     status: 'online',
//   },
//   {
//     id: '3',
//     title: 'Chris Jackson',
//     subTitle: '@jackson',
//     avatar_url:
//       'https://tinyfac.es/data/avatars/7D3FA6C0-83C8-4834-B432-6C65ED4FD4C3-500w.jpegerror',
//     status: 'busy',
//   },
//   {
//     id: '6',
//     title: 'John Smith',
//     subTitle: '@john',
//     avatar_url: 'https://d3iw72m71ie81c.cloudfront.net/female-17.jpg',
//     status: 'online',
//   },
//   {
//     id: '7',
//     title: 'Chris Jackson',
//     subTitle: '@jackson',
//     avatar_url: 'https://tinyfac.es/data/avatars/7D3FA6C0-83C8-4834-B432-6C65ED4FD4C3-500w.jpeg',
//     status: 'offline',
//   },
// ];

export default class GroupInfo extends Component {
  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    const { memberId } = this.props;
    this.group = DBManager.group;
    this.memberId = memberId;
    this._isMounted = false;
    this.state = {
      groupObj: {},
      members: [],
    };
  }

  componentWillMount() {
    const { memberId } = this.props;
    const groupObj = this.group.findById(memberId);
    this.setState({ groupObj });
  }

  componentDidMount() {
    this._isMounted = true;
    this.fetchGroupMembers();
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  getOnlineMembers(members) {
    if (members && typeof members === 'object') {
      return Object.keys(members)
        .filter((key) => members[key].status === 'online')
        .length.toString();
    }
    return '0';
  }

  fetchGroupMembers = async () => {
    const groupMembers = await DBManager._taskManager.chat.getGroupUsers(this.memberId);
    if (this._isMounted) {
      this.setState({
        members: this.createMembersList(groupMembers),
      });
    }
  };

  userprofile = (id) => {
    if (Actions.currentScene === 'GroupInfoScene') {
      Actions.MemberInfo({ eachmemberId: id });
    }
  };

  createMembersList(members) {
    if (members && typeof members === 'object') {
      return Object.keys(members).map((key) => {
        const member = members[key];
        const { _id: id, name, username, status } = member;
        const title = name || username || '';
        const avatarUrl = member.avatarURL || name;
        return {
          id,
          title,
          status,
          subTitle: `@${username}`,
          avatar_url: avatarUrl,
          onPress: () => this.userprofile(id),
          onAvatarPress: () => this.userprofile(id),
        };
      });
    }
    return [];
  }

  render() {
    const { members, groupObj } = this.state;
    const totalMembers = members.length.toString();
    const onlineMembers = this.getOnlineMembers(members);
    // const status = 'away';
    // let statusColor = iOSColors.gray;
    // switch (status) {
    //   case 'online':
    //     statusColor = iOSColors.green;
    //     break;
    //   case 'away':
    //     statusColor = iOSColors.yellow;
    //     break;
    //   case 'busy':
    //     statusColor = iOSColors.red;
    //     break;
    //   default:
    //     statusColor = iOSColors.midGray;
    // }

    return (
      <Screen>
        <NavBar
          leftComponent={
            <TouchableOpacity
              onPress={Actions.pop}
              style={[styles.navSideButtonDimension, styles.alignJustifyCenter]}
            >
              <Icon
                name="chevron-left"
                type="material-community"
                color={Colors.NAV_ICON}
                size={36}
              />
            </TouchableOpacity>
          }
          titleText="Group Info"
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <Profile
            avatarUrl={groupObj.avatarURL}
            avatarName={groupObj.name}
            avatarSize={80}
            profileTitle={groupObj.name || ''}
            profileUname={`${groupObj.description ? groupObj.description : ''}`}
            profileAnnouncement={`${groupObj.announcement ? groupObj.announcement : ''}`}
            onPress={() => {}}
            totalMembers={totalMembers}
            onlineMembers={onlineMembers}
            profileStyle={{ paddingBottom: 5 }}
          />
          {groupObj.name && (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 10,
                paddingBottom: 20,
              }}
            >
              <QRCodeGenerator
                qrValue={`https://${DBManager.app.app.host}/group/${
                  groupObj.name ? groupObj.name : ''
                }`}
                qrSize={120}
              />
            </View>
          )}
          <View style={styles.grayLine} />
          <ProfileList list={members} profileContainerStyle={{ paddingVertical: 5 }} />
        </ScrollView>
      </Screen>
    );
  }
}

GroupInfo.propTypes = {
  memberId: PropTypes.string,
};

GroupInfo.defaultProps = {
  memberId: '',
};
