import React, { Component } from 'react';
import { ScrollView, View } from 'react-native';
import { connect } from 'react-redux';
import { styles } from 'react-native-theme';
// import PropTypes from 'prop-types';
import { Screen, NavBar, Profile, ProfileList } from '@ui/components';
import { Actions } from 'react-native-router-flux';
// import { Colors } from '@ui/theme_default';
// import { LoginManager } from 'react-native-fbsdk';
// import firebase from 'react-native-firebase';
// import { GoogleSignin } from 'react-native-google-signin';
// import DBManager from '../app/DBManager';
import {DBManager} from 'app-module';

const logout = () => {
  // // Logout from Firebase
  // firebase.auth().signOut();
  // // Logout from Facebook
  // LoginManager.logOut();
  // // Logout from Google
  // GoogleSignin.signOut();
  // DBManager.app.resetPassword("SWami#4041$");
  DBManager.app.logout();
  Actions.Login();
};

class UserProfile extends Component {
  static propTypes = {};

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.app = DBManager.app.logout;
    this.stateUpdate = false;
    this.state = {
      name: '',
      avatar: '',
      profileList: [],
    };
  }

  componentDidMount() {
    const samplelist = [
      {
        id: '0',
        title: '...',
        icon: 'email-outline',
      },
      {
        id: '4',
        title: 'Logout',
        icon: 'logout',
        onPress: logout,
        style: 'color:2E88FF',
      },
    ];
    this.state = {
      name: '',
      avatar: '',
      profileList: samplelist,
    };

    DBManager.user.loginUserListner(this.updateUSerDetails);
  }

  changePassoword = () => {
    if (Actions.currentScene === 'UserProfileScene') {
      Actions.ChangePasswordScene();
    }
  };

  updateUSerDetails = async () => {
    const { buildNo, versionNo } = this.props;
    try {
      const userDetails = DBManager.user.loggedInUser;
      const avatarurl = userDetails ? DBManager.user.loggedInUser.avatarURL : '';
      const samplelist = [
        {
          id: '0',
          title: userDetails ? userDetails.emails || '...' : '',
          icon: 'email-outline',
        },
        {
          id: '1',
          title: 'Change Password',
          onPress: this.changePassoword,
          icon: 'lock-open-outline',
        },
        {
          id: '2',
          title: 'Logout',
          icon: 'logout',
          onPress: logout,
          style: 'color:2E88FF',
        },
        {
          id: '3',
          title: `Build: ${buildNo}`,
          icon: 'information-outline',
        },
        {
          id: '4',
          title: `Version: ${versionNo}`,
          icon: 'cellphone-settings-variant',
        },
      ];
      if (userDetails) {
        this.setState({
          name: userDetails.name,
          avatar: avatarurl,
          profileList: samplelist,
        });
      }
    } catch (error) {
      console.log('ERROR ON UPDATE USER DETAILS', error);
    }
  };

  render() {
    const { avatar, name, profileList } = this.state;
    return (
      <Screen>
        <NavBar
          // leftComponent={
          //   <TouchableOpacity onPress={Actions.pop}>
          //     <Icon
          //       name="chevron-left"
          //       type="material-community"
          //       color={Colors.NAV_ICON}
          //       size={36}
          //     />
          //   </TouchableOpacity>
          // }
          titleText="Profile"
          // rightComponent={
          //   <TouchableOpacity onPress={this.logoPress} /* onPress={() => this.onItemPressed()} */>
          //     <Icon
          //       name="account-edit"
          //       type="material-community"
          //       color={Colors.NAV_ICON}
          //       size={30}
          //     />
          //   </TouchableOpacity>
          // }
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* <ChangeListener currentLoginUser={this.currentLoginUser} /> */}
          <Profile
            avatarUrl={avatar}
            avatarName={name}
            avatarSize={150}
            // showIcon={true}
            profileTitle={name}
            // iconName="camera-iris"
            // iconSize={30}
            // iconColor="#FFF"
            onPress={() => {}}
          />
          <View style={styles.grayLine} />
          <ProfileList list={profileList} />
        </ScrollView>
      </Screen>
    );
  }
}

UserProfile.propTypes = {};

const mapStateToProps = (/* state */) => ({});

const mapDispatchToProps = (/* dispatch */) => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserProfile);
