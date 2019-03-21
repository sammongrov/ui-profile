import React, { Component } from 'react';
import { View, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { styles } from 'react-native-theme';
import { Actions } from 'react-native-router-flux';
import { Colors } from '@ui/theme_default';
import { NavBar, Screen, Icon, TextInput, Button, Text } from '@ui/components';
// import DBManager from '../app/DBManager';
import {DBManager} from 'app-module';

export default class ChangePassword extends Component {
  state = {
    newPassword: '',
    confirmPassword: '',
  };

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
  }

  componentWillUnmount = () => {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
  };

  handleBackPress = () => {
    Actions.pop();
    return true;
  };

  resetCallBack = (result, reason) => {
    if (result) {
      DBManager.app.logout();
      Actions.Login();
      // Alert.alert("Password changed")
    } else {
      Alert.alert(reason);
    }
  };

  updatePassword = (newPassword, confirmPassword) => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Password not match');
    } else {
      DBManager.app.resetPassword(newPassword, this.resetCallBack);
    }
  };

  render() {
    const { newPassword, confirmPassword } = this.state;
    return (
      <Screen>
        <NavBar
          titleText="Change Password"
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
        />
        <View style={styles.changePasswordContainer}>
          <View style={styles.columnDirection}>
            <Text style={[styles.authTFLabelView, styles.changePasswordTitleStyle]}>
              New Password
            </Text>
            <TextInput
              onChangeText={(text) => this.setState({ newPassword: text })}
              autoCapitalize="none"
              style={styles.authTFInput}
              value={newPassword}
              underlineColorAndroid="transparent"
              autoCorrect={false}
              clearButtonMode="while-editing"
              secureTextEntry
              disableFullscreenUI
            />
          </View>
          <View style={[styles.columnDirection, styles.marginTop20]}>
            <Text style={[styles.authTFLabelView, styles.changePasswordTitleStyle]}>
              Confirm Password
            </Text>
            <TextInput
              onChangeText={(text) => this.setState({ confirmPassword: text })}
              autoCapitalize="none"
              style={[styles.authTFInput]}
              value={confirmPassword}
              underlineColorAndroid="transparent"
              autoCorrect={false}
              clearButtonMode="while-editing"
              secureTextEntry
              disableFullscreenUI
            />
          </View>
          <Button
            title="Update Password"
            onPress={() => this.updatePassword(newPassword, confirmPassword)}
            color={Colors.BG_BTN}
            buttonStyle={[styles.serverConfirmButton]}
            containerStyle={[styles.marginTop15]}
          />
        </View>
      </Screen>
    );
  }
}
