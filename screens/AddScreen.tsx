import React from "react";
import {
    View, Dimensions, UIManager, LayoutAnimation, TouchableOpacity,
    StyleSheet, ScrollView, Text, Picker, DatePickerIOS, Platform,
    Image, AsyncStorage
} from "react-native";
import DatePicker from "react-native-datepicker";
import {Header, ListItem, Button} from "react-native-elements";
import Geocoder from "react-native-geocoding";
import {MapView, Permissions, ImagePicker} from "expo";
// import {Icon} from "react-native-elements";
// もしくは下記のパッケージ(https://oblador.github.io/react-native-vector-icons/)を使うこともできる．
// import Icon from "react-native-vector-icons/AntDesign";
// チュートリアルでは上記2つのいずれかの書き方でできる(というか本番用では上記で書くべきだろう)だろうが，
// Expoで開発する場合はアイコンが読み込まれずエラーとなる．そのため下記リンクのパッケージを
// 用いてアイコンの実装をする．
// https://github.com/expo/vector-icons
// https://expo.github.io/vector-icons/
import {AntDesign, MaterialIcons} from "@expo/vector-icons";
// ちなみに「import {Ionicons} from "@expo/vector-icons"」とした場合は下記から
// https://infinitered.github.io/ionicons-version-3-search/
import _ from "lodash";
import {connect} from "react-redux";

import * as actions from "../actions";
import {
    GREAT, GOOD, POOR,
    Review
} from "../types/types";

const ASSETS_PATH: string = "./../assets/";
const SCREEN_WIDTH = Dimensions.get("window").width;
const MAP_ZOOM_RATE: number = 15.0;
const INITIAL_STATE = {
    // 各項目のプルダウンメニューが開いているか否かのフラグ
    countryPickerVisible: false,
    dateFromPickerVisible: false,
    dateToPickerVisible: false,
    // 日付の初期値は本日
    chosenDateFrom: new Date().toLocaleString("ja"),
    chosenDateTo: new Date().toLocaleString("ja"),
    // 旅行の評価リストの初期値(プレースホルダにする値)
    tripDetail: {
        country: "Select Country",
        dateFrom: "From",
        dateTo: "To",
        imageSrcs: [
            require(ASSETS_PATH + "add_image_placeholder.png"),
            require(ASSETS_PATH + "add_image_placeholder.png"),
            require(ASSETS_PATH + "add_image_placeholder.png")
        ],
        rank: ""
    },
    // マップの初期値
    initialRegion: {
        // 東京タワーの座標にしとく
        latitude: 35.658581,
        longitude: 139.745433,
        latitudeDelta: MAP_ZOOM_RATE,
        longitudeDelta: MAP_ZOOM_RATE * 2.25
    }
};

class AddScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = INITIAL_STATE;
    }


    // 画面上で何か再描画されるたびになめらかなアニメーションを適用する
    componentDidUpdate(): void {
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.easeInEaseOut();
    }


    renderCountryPicker(): JSX.Element {
        if (this.state.countryPickerVisible) {
            return (
                <Picker
                    // 画面に表示する選択された値
                    selectedValue={this.state.tripDetail.country}
                    // 選択値が変化したらその値を適用する．引数はPicker.Itemのvalue属性？
                    onValueChange={async (itemValue) => {
                        // GoogleMapAPIから選択された国のいち情報を取得
                        Geocoder.setApiKey(/* APIキー */);
                        let result = await Geocoder.getFromLocation(itemValue);

                        this.setState({
                            ...this.state,
                            tripDetail: {
                                ...this.state.tripDetail,
                                country: itemValue
                            },
                            initailRegion: {
                                latitude: result.results[0].geometry.location.lat,
                                longitude: result.results[0].geometry.location.lng,
                                latitudeDelta: MAP_ZOOM_RATE,
                                longitudeDelta: MAP_ZOOM_RATE * 2.25
                            }
                        });
                    }}
                >
                    <Picker.Item label={INITIAL_STATE.tripDetail.country} value={INITIAL_STATE.tripDetail.country} />
                    <Picker.Item label="USA" value="USA" />
                    <Picker.Item label="UK" value="UK" />
                    <Picker.Item label="Japan" value="Japan" />
                    <Picker.Item label="China" value="China" />
                    <Picker.Item label="India" value="India" />
                    <Picker.Item label="Korea" value="Korea" />
                    <Picker.Item label="Russia" value="Russia" />
                    <Picker.Item label="Australia" value="Australia" />
                    <Picker.Item label="France" value="France" />
                    <Picker.Item label="Germany" value="Germany" />
                </Picker>
            );
        }
    }

    renderDateFromPicker(): JSX.Element {
        if (this.state.dateFromPickerVisible) {
            switch (Platform.OS) {
                case "ios":
                    return(
                        <DatePickerIOS
                            mode="date"
                            date={new Date(this.state.chosenDateFrom)}
                            onDateChange={(date) => {
                                const dateString: string = date.toLocaleString("ja");

                                this.setState({
                                    tripDetail: {
                                        ...this.state.tripDetail,
                                        dateFrom: dateString.split(' ')[0]
                                    },
                                    chosenDateFrom: dateString,
                                    chosenDateTo: dateString // 帰国日は出国日の後に設定するものとして出国日にセットしておく
                                });
                            }}
                        />
                    );
                case "android":
                    return (
                        <View style={{alignItems: "center"}}>
                            <DatePicker
                                mode="date"
                                date={new Date(this.state.chosenDateFrom)}
                                format="YYYY-MM-DD"
                                confirmBtnText="OK"
                                cancelBtnText="キャンセル"
                                onDateChange={(date) => {
                                    let dateString: string = date.replace(/-/g, "/");

                                    this.setState({
                                        tripDetail: {
                                            ...this.state.tripDetail,
                                            dateFrom: dateString.split(" ")[0]
                                        },
                                        chosenDateFrom: dateString,
                                        chosenDateTo: dateString // 帰国日は出国日の後に設定するものとして出国日にセットしておく
                                    });
                                }}
                            />
                        </View>
                    );
                default:
                    return (
                        <View />
                    );
            }
        }
    }

    renderDateToPicker(): JSX.Element {
        if (this.state.dateToPickerVisible) {
            switch (Platform.OS) {
                case "ios":
                    return(
                        <DatePickerIOS
                            mode="date"
                            date={new Date(this.state.chosenDateTo)}
                            onDateChange={(date) => {
                                const dateString: string = date.toLocaleString("ja");

                                this.setState({
                                    tripDetail: {
                                        ...this.state.tripDetail,
                                        dateTo: dateString.split(' ')[0]
                                    },
                                    chosenDateTo: dateString
                                });
                            }}
                        />
                    );
                case "android":
                    return (
                        <View style={{alignItems: "center"}}>
                            <DatePicker
                                mode="date"
                                date={new Date(this.state.chosenDateTo)}
                                format="YYYY-MM-DD"
                                confirmBtnText="OK"
                                cancelBtnText="キャンセル"
                                onDateChange={(date) => {
                                    let dateString: string = date.replace(/-/g, "/");

                                    this.setState({
                                        tripDetail: {
                                            ...this.state.tripDetail,
                                            dateTo: dateString.split(" ")[0]
                                        },
                                        chosenDateTo: dateString
                                    });
                                }}
                            />
                        </View>
                    );
                default:
                    return (
                        <View />
                    );
            }
        }
    }

    renderMap(): JSX.Element {
        if (
            this.state.tripDetail.country !== INITIAL_STATE.tripDetail.country &&
            !this.state.countryPickerVisible
        ) { // 国選択が初期値でない，かつ国選択プルダウンが閉じているとき
            return (
                <MapView
                    style={{height: SCREEN_WIDTH}}
                    scrollEnabled={false}
                    cacheEnabled={Platform.OS === "android"}
                    initialRegion={this.state.initailRegion}
                />
            );
        }
    }

    onImagePress = async (index: number): Promise<void> => {
        // AsyncStorageからカメラロールへのアクセス許可に関するフラグを取得
        let cameraRollPermission = await AsyncStorage.getItem('cameraRollPermission');

        if (cameraRollPermission !== 'granted') { // アクセス許可されていない or 空の場合
            // アクセス許可を求める
            let permission = await Permissions.askAsync(Permissions.CAMERA_ROLL);

            if (permission.status !== "granted") { // アクセス拒否されたら
                // 何もせずここで処理の打ち切り
                return;
            }

            // アクセス許可のフラグをAsyncStorageに保存
            await AsyncStorage.setItem('cameraRollPermission', permission.status);
        }

        // カメラロールを起動
        let result: ImagePicker.ImageResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // 画像の拡張子のみ選択可
            allowsEditing: true
        });

        if (!result.cancelled) { // ユーザが正常に画像を選択したら
            // 現在の画像リストをコピー
            const newImageSrcs = this.state.tripDetail.imageSrcs;
            // 画像リストの内，対応するインデックスの画像を変更する
            // なんかresult.uriでエラー出てるけど大本のコードではcancelled=falseならちゃんと入ってる．
            // 画像ファイルの変数は「端末からから：{uri: (画像パス)}」形式または
            // 「コード内：require(画像パス)」形式で書かないといけない．
            // よって以下は前者の形式で書くべき．「{src: ...}」と書いてはダメ！
            newImageSrcs[index] = {uri: result.uri};

            // 上記の変更をthis.stateに反映
            this.setState({
                ...this.state,
                tripDetail: {
                    ...this.state.tripDetail,
                    imageSrcs: newImageSrcs
                }
            });
        }
    }
    renderImagePicker(): JSX.Element {
        if (
            this.state.tripDetail.country !== INITIAL_STATE.tripDetail.country &&
            !this.state.countryPickerVisible
        ) {
            return (
                <View style={{flexDirection: "row"}}>
                    {this.state.tripDetail.imageSrcs.map((image, index) => {
                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => this.onImagePress(index)}
                            >
                                <Image
                                    style={{
                                        width: SCREEN_WIDTH / this.state.tripDetail.imageSrcs.length,
                                        height: SCREEN_WIDTH / this.state.tripDetail.imageSrcs.length
                                    }}
                                    source={image}
                                />
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );
        }
    }

    onReviewBtnPressed = (rank: string): void => {
        // 評価の変更をthis.stateに適用する
        this.setState({
            ...this.state,
            tripDetail: {
                ...this.state.tripDetail,
                rank: rank
            }
        });
    }
    renderReviewBtns(): JSX.Element {
        if (
            this.state.tripDetail.country !== INITIAL_STATE.tripDetail.country &&
            !this.state.countryPickerVisible
        ) {
            return (
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "center",
                        paddingTop: 10
                    }}
                >
                    <MaterialIcons
                        raised
                        name={GREAT["name"]}
                        size={80}
                        color={this.state.tripDetail.rank === GREAT["name"] ? GREAT["color"] : "gray"}
                        onPress={() => this.onReviewBtnPressed(GREAT["name"])}
                    />
                    <MaterialIcons
                        raised
                        name={GOOD["name"]}
                        size={80}
                        color={this.state.tripDetail.rank === GOOD["name"] ? GOOD["color"] : "gray"}
                        onPress={() => this.onReviewBtnPressed(GOOD["name"])}
                    />
                    <MaterialIcons
                        raised
                        name={POOR["name"]}
                        size={80}
                        color={this.state.tripDetail.rank === POOR["name"] ? POOR["color"] : "gray"}
                        onPress={() => this.onReviewBtnPressed(POOR["name"])}
                    />
                </View>
            );
        }
    }

    onAddBtnPressed = async (): Promise<void> => {
        const newImageSrcs = [];
        for (let i: number = 0; i < this.state.tripDetail.imageSrcs.length; i++) {
            if (this.state.tripDetail.imageSrcs[i] !== require(ASSETS_PATH + "add_image_placeholder.png")) { // 未添付の代替画像でなければ
                // 添付された画像として配列に追加
                newImageSrcs.push(this.state.tripDetail.imageSrcs[i]);
            }

            // 添付された画像のみを格納したimageSrcsを持つtripDetailを用意する
            const tripDetail = this.state.tripDetail;
            tripDetail.imageSrcs = newImageSrcs;

            // AsyncStorageから評価リストを取得
            let stringifiedAllReviews: string = await AsyncStorage.getItem('allReviews');
            let allReviews: Review[] = JSON.parse(stringifiedAllReviews);

            if (_.isNull(allReviews)) { // 取得した評価リストが空なら
                // 空の配列として用意
                allReviews = [];
            }

            // 新しい評価を評価リストに追加
            allReviews.push(tripDetail);

            try {
                // 更新された評価リストをAsyncStorageに保存
                await AsyncStorage.setItem('allReviews', JSON.stringify(allReviews));
            } catch (e) {
                console.warn(e);
            }

            // Action creatorを呼び出してHomeScreenを再描画
            this.props.fetchAllReviews();

            // this.stateを初期化
            this.setState({
                ...INITIAL_STATE,
                tripDetail: {
                    ...INITIAL_STATE.tripDetail,
                    imageSrcs: [
                        require(ASSETS_PATH + "add_image_placeholder.png"),
                        require(ASSETS_PATH + "add_image_placeholder.png"),
                        require(ASSETS_PATH + "add_image_placeholder.png")
                    ]
                }
            });

            // HomeScreenにリダイレクト
            this.props.navigation.navigate("home");
        }
    }
    renderAddBtn(): JSX.Element {
        // 入力完了フラグ(後で偽の場合を探る)
        let isComplete: boolean = true;
        // 未入力項目が無いか調べる
        for (let key in this.state.tripDetail) {
            if (
                key !== "imageSrcs" &&
                this.state.tripDetail[key] === INITIAL_STATE.tripDetail[key]
            ) { // 初期値のままの項目があったら(画像は必須入力ではないので飛ばす)
                // 入力未完了に切り替え
                isComplete = false;
            }
        }

        return (
            <View style={{padding: 20}}>
                <Button
                    title="Add"
                    color="white"
                    buttonStyle={{backgroundColor: "deepskyblue"}}
                    onPress={() => this.onAddBtnPressed()}
                    disabled={!isComplete} // 入力未完了ならクリックできないようにする
                />
            </View>
        );
    }


    render(): JSX.Element {
        return (
            <View style={{flex: 1}}>
                <Header
                    statusBarProps={{barStyle: "light-content"}}
                    backgroundColor="deepskyblue"
                    leftComponent={
                        <AntDesign
                            name="close"
                            color="white"
                            size={40}
                            onPress={() => {
                                // 「×」ボタンをクリックされたら(=保存せずホームに戻ったら)全ての入力を初期化
                                this.setState({
                                    ...INITIAL_STATE,
                                    tripDetail: { // この項目に配列を含んでいるため単純に「...INITIAL_STATE」のみで初期化できず，配列を含むものは別に初期化する必要あり．
                                        ...INITIAL_STATE.tripDetail,
                                        imageSrcs: [
                                            require(ASSETS_PATH + "add_image_placeholder.png"),
                                            require(ASSETS_PATH + "add_image_placeholder.png"),
                                            require(ASSETS_PATH + "add_image_placeholder.png")
                                        ]
                                    }
                                });

                                // HomeScreenに戻る
                                this.props.navigation.navigate("home");
                            }}
                        />
                    }
                    centerComponent={{text: "Add", style: styles.headerStyle}}
                />
                <ScrollView>
                    <ListItem
                        title="Country: "
                        subtitle={
                            <View style={styles.listItemStyle}>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        // 選択肢が初期値ならグレー．選択状態なら黒．
                                        color: this.state.tripDetail.country === INITIAL_STATE.tripDetail.country ? "gray" : "black"
                                    }}
                                >
                                    {this.state.tripDetail.country}
                                </Text>
                            </View>
                        }
                        rightIcon={
                            <MaterialIcons
                                // プルダウンメニューが開いていれば上矢印，閉じていれば下矢印
                                name={this.state.countryPickerVisible === true ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                size={30}
                                onPress={() => this.setState({
                                    // countryのプルダウンメニューの開閉フラグを切り替える
                                    countryPickerVisible: !this.state.countryPickerVisible,
                                    // 開閉いずれにしても他のプルダウンは全て閉じる
                                    dateFromPickerVisible: false,
                                    dateToPickerVisible: false
                                })}
                            />
                        }
                    />
                    {this.renderCountryPicker()}

                    <ListItem
                        title="Date: "
                        subtitle={
                            <View style={styles.listItemStyle}>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        // 選択肢が初期値ならグレー．選択状態なら黒．
                                        color: this.state.tripDetail.dateFrom === INITIAL_STATE.tripDetail.dateFrom ? "gray" : "black"
                                    }}
                                >
                                    {this.state.tripDetail.dateFrom}
                                </Text>
                            </View>
                        }
                        rightIcon={
                            <MaterialIcons
                                // プルダウンメニューが開いていれば上矢印，閉じていれば下矢印
                                name={this.state.dateFromPickerVisible === true ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                size={30}
                                onPress={() => this.setState({
                                    // dateFromのプルダウンメニューの開閉フラグを切り替える
                                    dateFromPickerVisible: !this.state.dateFromPickerVisible,
                                    // 開閉いずれにしても他のプルダウンは全て閉じる
                                    countryPickerVisible: false,
                                    dateToPickerVisible: false
                                })}
                            />
                        }
                    />
                    {this.renderDateFromPicker()}

                    <ListItem
                        title=""
                        subtitle={
                            <View style={styles.listItemStyle}>
                                <Text
                                    style={{
                                        fontSize: 18,
                                        // 選択肢が初期値ならグレー．選択状態なら黒．
                                        color: this.state.tripDetail.dateTo === INITIAL_STATE.tripDetail.dateTo ? "gray" : "black"
                                    }}
                                >
                                    {this.state.tripDetail.dateTo}
                                </Text>
                            </View>
                        }
                        rightIcon={
                            <MaterialIcons
                                // プルダウンメニューが開いていれば上矢印，閉じていれば下矢印
                                name={this.state.dateToPickerVisible === true ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                                size={30}
                                onPress={() => this.setState({
                                    // dateToのプルダウンメニューの開閉フラグを切り替える
                                    dateToPickerVisible: !this.state.dateToPickerVisible,
                                    // 開閉いずれにしても他のプルダウンは全て閉じる
                                    countryPickerVisible: false,
                                    dateFromPickerVisible: false
                                })}
                            />
                        }
                    />
                    {this.renderDateToPicker()}

                    {this.renderMap()}

                    {this.renderImagePicker()}

                    {this.renderReviewBtns()}

                    {this.renderAddBtn()}
                </ScrollView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    headerStyle: {
        color: "white",
        fontSize: 24,
        fontWeight: "bold"
    },
    listItemStyle: {
        paddingTop: 5,
        paddingLeft: 20
    }
});


const mapStateToProps = (state) => {
    return {
        allReviews: state.review.allReviews
    };
};

export default connect(mapStateToProps, actions)(AddScreen);