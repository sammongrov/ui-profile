import React, { Component } from 'react';
import { TouchableOpacity, ScrollView } from 'react-native';
import moment from 'moment';
import { Colors } from '@ui/theme_default';

import { styles } from 'react-native-theme';
import { Actions } from 'react-native-router-flux';
import PropTypes from 'prop-types';
import { Screen, NavBar, Icon, ProfileList } from '@ui/components';
// import { Colors } from '@ui/theme_default';
// import DBManager from '../app/DBManager';
import {DBManager} from 'app-module';
// const styles = StyleSheet.create({});
import {Application} from '@mongrov/config';

export default class MessageInfo extends Component {
  constructor(props) {
    super(props);
    const { messageId } = this.props;
    const { chat } = DBManager._taskManager;
    chat.getMessageInfo(messageId, this.messageInfo);
    console.log('messageInfo MESSAGE ID', messageId);
    this.state = {
      memberList: [],
    };
  }

  messageInfo = (error, messageInfo) => {
    if (!error) {
      const memberList = [];

      for (let i = 0; i < messageInfo.length; i += 1) {
        const _messageInfo = messageInfo[i];
        const users = {
          id: _messageInfo.user._id,
          title: _messageInfo.user.name,
          subTitle: `@${_messageInfo.user.username}`,
          avatar_url: `${Application.urls.SERVER_URL}/avatar/${_messageInfo.user.username}`,
          date: moment(_messageInfo.ts).format('MMM Do YY'),
          time: moment(_messageInfo.ts).format('LT'),
        };
        memberList.push(users);
      }
      this.setState({
        memberList,
      });
    }
  };

  render() {
    const { memberList } = this.state;
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
          titleText="Read By"
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <ProfileList list={memberList} />
        </ScrollView>
      </Screen>
    );
  }
}

MessageInfo.propTypes = {
  messageId: PropTypes.string,
};

MessageInfo.defaultProps = {
  messageId: '',
};
