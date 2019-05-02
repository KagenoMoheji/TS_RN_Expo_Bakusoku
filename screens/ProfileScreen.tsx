import React from "react";
import {
    View, AsyncStorage, Alert
} from "react-native";
import {Button} from "react-native-elements";
import {connect} from "react-redux";

import * as actions from "../actions";

class ProfileScreen extends React.Component {
    onResetBtnPress = async (key: string): Promise<void> => {
        // AsyncStorageから該当のキーに対応するデータを削除
        await AsyncStorage.removeItem(key);

        if (key === 'allReviews') { // AsyncStorageから削除した対象のキーが'allReviews'(念の為シングルクォーテーション)ならば
            // AsyncStorageで殻になっているので，fetchAllReviews()で戻り値nullとしての処理がなされる．
            // これをしないとAsyncStorageから削除しても，プログラム上のリストにデータが残ってしまい，
            // 画面上に評価データが残って表示されてしまう．
            this.props.fetchAllReviews();
        }

        Alert.alert(
            "Reset",
            `'${key}' in AsyncStorage has been removed`,
            [
                {"text": "OK"}
            ],
            {cancelable: false}
        );

        if (key === 'isInitialized') { // チュートリアルフラグの初期化だったら
            // チュートリアル画面に戻る
            this.props.navigation.navigate("tutorial");
        }
    }

    render(): JSX.Element {
        return (
            <View style={{flex: 1, justifyContent: "center"}}>
                <View style={{padding: 20}}>
                    <Button
                        title="Go to Setting1"
                        onPress={() => this.props.navigation.navigate("setting1")}
                    />
                </View>
                <View style={{padding: 20}}>
                    <Button
                        title="Read tutorial"
                        onPress={() => this.onResetBtnPress('isInitialized')}
                    />
                </View>
                <View style={{padding: 20}}>
                    <Button
                        title="Reset all reviews"
                        buttonStyle={{backgroundColor: "red"}}
                        onPress={() => this.onResetBtnPress('allReviews')}
                    />
                </View>
            </View>
        );
    }
}


// fetchAllRevies()というAction creatorを使っているので以降の紐づけを実装．
const mapStateToProps = (state) => {
    return {
        allReviews: state.review.allRevies
    };
}

export default connect(mapStateToProps, actions)(ProfileScreen);