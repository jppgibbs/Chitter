import React, {Component} from 'react';
import {
  Text,
  TextInput,
  View,
  Alert,
  Button,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Avatar} from 'react-native-elements';

class UserProfile extends Component {
  // Construct variables with default empty values
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      given_name: '',
      family_name: '',
      loggedIn: '',
      user_id: '',
      profile_id: '',
      x_auth: '',
      validation: '',
      profileData: [],
    };
  }
  componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      console.log('secondary load');
      this.retrieveAccount();
    });
    console.log('first load');
    this.retrieveAccount();
  }
  async retrieveAccount() {
    try {
      // Retreieve from Async Storage
      const user_id = await AsyncStorage.getItem('user_id');
      const x_auth = await AsyncStorage.getItem('x_auth');

      // Parse into JSON
      const user_id_json = await JSON.parse(user_id);
      const x_auth_json = await JSON.parse(x_auth);
      this.setState({
        x_auth: x_auth_json,
        user_id: user_id_json,
      });
      console.log(
        'Debug: EditAccount Loaded with uid: ' +
          this.state.user_id +
          ' auth key: ' +
          this.state.x_auth,
      );
      this.getProfileData();
    } catch (e) {
      console.error(e);
    }
  }
  getProfileData() {
    return fetch('http://10.0.2.2:3333/api/v0.0.5/user/' + this.state.user_id, {
      method: 'GET',
    })
      .then(response => response.json())
      .then(responseJson => {
        this.setState(
          {
            profileData: responseJson,
          },
          () => {
            console.log('Debug: Account retrieved profile async');
          },
        );
      })
      .catch(error => {
        console.log(error);
      });
  }


  // Logout
  async clearAccount() {
    try {
      await AsyncStorage.removeItem('x_auth');
      await AsyncStorage.removeItem('user_id');
      console.log('Cleared account information from async');
      this.retrieveAccount();
    } catch (error) {
      console.log('Removing auth key failed: ' + error);
    }
  }
  Logout = () => {
    return fetch('http://10.0.2.2:3333/api/v0.0.5/logout', {
      method: 'POST',
      withCredentials: true,
      headers: {
        'X-Authorization': this.state.x_auth,
        'Content-Type': 'application/json',
      },
    })
      .then(responseJson => {
        this.clearAccount();
        Alert.alert('Logout', 'Successfully Logged Out');
        this.props.navigation.navigate('Account');
      })
      .catch(error => {
        Alert.alert('Logout', 'Logout Failed');
        console.log('Logout from server failed: ' + error);
      });
  };

  render() {
    // IF LOGGED IN
    console.log('Debug: Profile loaded as logged in');
    return (
      <View style={styles.AccountControls}>
        <Image
          source={{
            uri:
              'http://10.0.2.2:3333/api/v0.0.5/user/' +
              this.state.user_id +
              '/photo',
          }}
          style={styles.profilePic}
        />
        <Text style={styles.nameText}>
          {this.state.profileData.given_name}{' '}
          {this.state.profileData.family_name}
        </Text>
        <Text style={styles.detailText}>{this.state.profileData.email}</Text>
        <Text style={styles.detailText}>
          Account ID: {this.state.profileData.user_id}
        </Text>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.bodyText}>Navigate your account settings:</Text>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('View Profile')}
          style={styles.button}>
          <Text style={styles.bodyText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate('Edit Profile')}
          style={styles.button}>
          <Text style={styles.bodyText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.Logout()} style={styles.button}>
          <Text style={styles.bodyText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#17202b',
    color: '#ffffff',
  },
  AccountControls: {
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#17202b',
    color: '#ffffff',
  },
  button: {
    alignItems: 'center',
    elevation: 2,
    padding: 10,
    marginTop: 5,
    marginBottom: 0,
    borderColor: '#101010',
    borderWidth: 1,
    borderRadius: 2,
    backgroundColor: '#2296f3',
    marginLeft: 15,
    marginRight: 15,
  },
  textEntry: {
    alignItems: 'center',
    padding: 5,
    color: '#ffffff',
    marginTop: 5,
    marginBottom: 0,
    borderColor: '#2296f3',
    borderRadius: 2,
    borderWidth: 1,
    backgroundColor: '#273341',
    elevation: 3,
    marginLeft: 15,
    marginRight: 15,
  },
  profilePic: {
    width: 150,
    height: 150,
    marginHorizontal: '30%',
    borderRadius: 100,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 15,
    marginRight: 15,
    marginBottom: 5,
  },
  bodyText: {
    color: '#ffffff',
    marginLeft: 15,
    marginRight: 15,
  },
  nameText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 32,
    marginHorizontal: '30%',
  },
  detailText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    marginHorizontal: '32%',
  },
});

export default UserProfile;
