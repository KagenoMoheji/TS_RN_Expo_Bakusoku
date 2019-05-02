import React from "react";
import {StyleSheet, View, Platform, Image, StatusBar} from "react-native";
import {createAppContainer, createBottomTabNavigator, createSwitchNavigator, createStackNavigator} from "react-navigation";
import {Provider} from "react-redux";
import store from "./store";

import TutorialScreen from "./screens/TutorialScreen";
import HomeScreen from "./screens/HomeScreen";
import DetailScreen from "./screens/DetailScreen";
import AddScreen from "./screens/AddScreen";
import ProfileScreen from "./screens/ProfileScreen";
import Setting1Screen from "./screens/Setting1Screen";
import Setting2Screen from "./screens/Setting2Screen";

export default class App extends React.Component {
  render(): JSX.Element {
    // ヘッダーの共通オプション指定
    const headerNavigationOptions = {
      headerStyle: {
        backgroundColor: "deepskyblue",
        marginTop: (Platform.OS === "android" ? 24 : 0), // Androidなら上部にスペースを加えておく
      },
      headerTitleStyle: {
        color: "white",
        // https://stackoverflow.com/a/45027059
        // 上記リンクの「headerLayoutPreset: "center"」のやり方や，
        // https://stackoverflow.com/a/49973484
        // 上記リンクの「headerTitleStyle: {textAlign: "center", flex: 1}」のやり方で
        // タイトルの中央配置ができた．今回は後者を採用．
        textAlign: "center",
        flex: 1
      },
      headerTintColor: "white"
    };


    // スライド画面のコンポーネント構成の定義(ルーティングっぽい)
    const HomeStack = createStackNavigator({
      home: {
        screen: HomeScreen,
        navigationOptions: {
          ...headerNavigationOptions, // 「...」をつけることで上で定義した配列がここに自動展開・格納される．
          headerTitle: "Treco",
          headerBackTitle: "Home" // 戻るボタンに表示させるテキスト※iOSのみ表示される
        }
      },
      detail: {
        screen: DetailScreen,
        navigationOptions: {
          ...headerNavigationOptions,
          headerTitle: "Detail"
        }
      }
    });
    HomeStack.navigationOptions = ({navigation}) => {
      return {
        tabBarVisible: (navigation.state.index === 0) // ナビゲーションの階層が1階層目の場合のみタブバーを表示
      };
    };

    const AddStack = createStackNavigator({
      add: {
        screen: AddScreen,
        navigationOptions: {
          header: null // ヘッダーを消す
        }
      }
    });
    AddStack.navigationOptions = ({navigation}) => {
      return {
        tabBarVisible: (navigation.state.index === -1) // ナビゲーションの階層全てにおいてタブバーを非表示
      };
    };

    const ProfileStack = createStackNavigator({
      profile: {
        screen: ProfileScreen,
        navigationOptions: {
          ...headerNavigationOptions,
          headerTitle: "Treco",
          headerBackTitle: "Profile"
        }
      },
      setting1: {
        screen: Setting1Screen,
        navigationOptions: {
          ...headerNavigationOptions,
          headerTitle: "Setting 1"
        }
      },
      setting2: {
        screen: Setting2Screen,
        navigationOptions: {
          ...headerNavigationOptions,
          headerTitle: "Setting 2"
        }
      }
    });
    ProfileStack.navigationOptions = ({navigation}) => {
      return {
        tabBarVisible: (navigation.state.index === 0)
      };
    };

    // [Tutorial, [Home, Add, Profile]]というタブ仕様のコンポーネントを実装．
    const MainTab = createBottomTabNavigator({
      homeStack: {
        screen: HomeStack,
        navigationOptions: {
          tabBarIcon: ({tintColor}) => (
            <Image
              style={{
                height: 25,
                width: 25,
                tintColor: tintColor
              }}
              source={require("./assets/home.png")}
            />
          ),
          title: "Home"
        }
      },
      addStack: {
        screen: AddStack,
        navigationOptions: {
          tabBarIcon: ({tintColor}) => (
            <Image
              style={{
                height: 60,
                width: 60,
                tintColor: "deepskyblue"
              }}
              source={require("./assets/add.png")}
            />
          ),
          title: "" // ボタンタイトルを非表示
        }
      },
      profileStack: {
        screen: ProfileStack,
        navigationOptions: {
          tabBarIcon: ({tintColor}) => (
            <Image
              style={{
                height: 25,
                width: 25,
                tintColor: tintColor
              }}
              source={require("./assets/profile.png")}
            />
          ),
          title: "Profile"
        }
      }
    }, {
      swipeEnabled: false, // Androidにおいてスワイプ遷移できないようにする？
    });

    // https://qiita.com/kana-t/items/366c9c07a4c81d6b6c1e
    // 上記リンク参考に，react-navigationはver3になって書き方が変わっていて，
    // チュートリアルの書き方に「createAppContainer()」を使わないといけない．
    const NavTab = createAppContainer(
      /*
      createBottomTabNavigator({
        tutorial: {screen: TutorialScreen},
        main: {screen: MainTab}
      }, {
        navigationOptions: ({
          tabBarVisible: false
        })
      })

      // チュートリアルでは上記の書き方でタブバー非表示のスライド画面を実装しようとしていたが，
      // 下記リンクの公式のやり方でもうまくいかなかった．
      // https://reactnavigation.org/docs/en/navigation-options-resolution.html#a-tab-navigator-contains-a-stack-and-you-want-to-hide-the-tab-bar-on-specific-screens
      // しかし「createSwitchNavigator()」が同等と実装だったのでそれを採用した．
      */
      createSwitchNavigator({
        tutorial: {screen: TutorialScreen},
        main: {screen: MainTab}
      })
    );


    return (
      <Provider store={store}>
        <View style={styles.container}>
          <StatusBar barStyle="light-content" />
          <NavTab />
        </View>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: "center", // これがあるとなぜか真っ白になる．
    justifyContent: "center"
  }
});


