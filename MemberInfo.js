import React, { Component } from 'react';
import { TouchableOpacity, View, ScrollView } from 'react-native';
import { Text, Screen, NavBar, /* Avatar */ Icon, Profile, QRCodeGenerator } from '@ui/components';
import { Colors } from '@ui/theme_default';
import moment from 'moment';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { styles } from 'react-native-theme';
import { iOSColors } from 'react-native-typography';
// import DBManager from '../app/DBManager';
import {DBManager} from 'app-module';

export default class MemberInfo extends Component {
  constructor(props) {
    super(props);
    const { memberId, eachmemberId } = this.props;
    this.user = DBManager.user;
    this.group = DBManager.group;
    this.memberId = memberId;
    this.eachmemberId = eachmemberId;
    this._isMounted = false;
    this.state = {
      groupObj: {},
      members: [],
      memberObj: {},
    };
  }

  componentWillMount() {
    if (this.memberId) {
      const groupDetailList = this.group.findById(this.memberId);
      this.setState({
        groupObj: groupDetailList,
      });
    }
  }

  componentDidMount() {
    this._isMounted = true;
    if (this.memberId) {
      this.fetchGroupMembers();
    } else if (this.eachmemberId) {
      this.updateUSerDetails();
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  };

  getUserMember(groupObj, members) {
    const { name } = groupObj;
    const index = Object.keys(members).find((key) => members[key].username === name);
    return members[index];
  }

  getProfileTitle(user, member) {
    if (user && user.name) {
      return user.name;
    }
    if (member && member.title) {
      return member.title;
    }
    if (user && user.username) {
      return user.username;
    }
    return '';
  }

  fetchGroupMembers = async () => {
    const groupMembers = await DBManager._taskManager.chat.getGroupUsers(this.memberId);
    if (this._isMounted) {
      this.setState({ members: groupMembers });
    }
  };

  updateUSerDetails = async () => {
    if (this.eachmemberId) {
      try {
        const userDetails = DBManager.user.findById(this.eachmemberId);
        if (userDetails) {
          this.setState({
            memberObj: userDetails,
          });
        }
      } catch (error) {
        console.log('ERROR ON UPDATE USER DETAILS', error);
      }
    }
  };

  render() {
    if (this.memberId) {
      const { groupObj: member, members } = this.state;
      const user = this.getUserMember(member, members);
      const profileTitle = this.getProfileTitle(user, member);
      const statusInfo = user && user.status ? user.status : '';
      let statusColor = iOSColors.gray;
      switch (statusInfo) {
        case 'online':
          statusColor = iOSColors.green;
          break;
        case 'away':
          statusColor = iOSColors.yellow;
          break;
        case 'busy':
          statusColor = iOSColors.red;
          break;
        default:
          statusColor = iOSColors.midGray;
      }
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
            titleText="Member Info"
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Profile
              avatarUrl={member.avatarURL ? member.avatarURL : member.name}
              avatarName={member.name ? member.name : ''}
              avatarSize={150}
              profileTitle={profileTitle}
              profileUname={`@${user && user.username ? user.username : member.name}`}
              showStatusText={user && user.status ? user.status : ''}
              profileMailId={user ? user.emails || '...' : ''}
              lastLoginTime={user && user.lastLogin ? user.lastLogin : null}
              statusColor={statusColor}
            />
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>{moment().toString()}</Text>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 30,
              }}
            >
              <QRCodeGenerator
                qrValue={`https://${DBManager.app.app.host}/direct/${
                  member.name ? member.name : ''
                }`}
                qrSize={120}
              />
            </View>
          </ScrollView>
        </Screen>
      );
    }
    if (this.eachmemberId) {
      const { memberObj } = this.state;
      const statusInfo = memberObj && memberObj.status ? memberObj.status : '';
      let statusColor = iOSColors.gray;
      switch (statusInfo) {
        case 'online':
          statusColor = iOSColors.green;
          break;
        case 'away':
          statusColor = iOSColors.yellow;
          break;
        case 'busy':
          statusColor = iOSColors.red;
          break;
        default:
          statusColor = iOSColors.midGray;
      }
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
            titleText="Member Profile"
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Profile
              avatarUrl={memberObj.avatarURL ? memberObj.avatarURL : memberObj.name}
              avatarName={memberObj.name ? memberObj.name : ''}
              avatarSize={150}
              profileTitle={memberObj.name ? memberObj.name : ''}
              profileUname={`@${memberObj.username ? memberObj.username : ''}`}
              showStatusText={memberObj && memberObj.status ? memberObj.status : ''}
              profileMailId={memberObj ? memberObj.emails || '...' : ''}
              lastLoginTime={memberObj && memberObj.lastLogin ? memberObj.lastLogin : null}
              statusColor={statusColor}
              onPress={() => {}}
            />
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>{moment().toString()}</Text>
            </View>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 30,
              }}
            >
              <QRCodeGenerator
                qrValue={`https://${DBManager.app.app.host}/direct/${
                  memberObj.username ? memberObj.username : ''
                }`}
                qrSize={120}
              />
            </View>
          </ScrollView>
        </Screen>
      );
    }
  }
}

MemberInfo.propTypes = {
  memberId: PropTypes.string,
  eachmemberId: PropTypes.string,
};

MemberInfo.defaultProps = {
  memberId: '',
  eachmemberId: '',
};
