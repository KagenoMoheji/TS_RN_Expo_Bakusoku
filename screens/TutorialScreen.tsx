import React from "react";
import {
    StyleSheet, Text, View, ScrollView, Dimensions, 
    Image, AsyncStorage, ActivityIndicator
} from "react-native";
import {Button} from "react-native-elements";
import _ from "lodash";
// チュートリアルでは以下のAppLoadingを使ったが，
// import {AppLoading} from "expo";
// クルクルのやつが欲しかったので以下リンクを参考にreact-native/ActivityIndicatorを採用．
// https://bagelee.com/programming/react-native/activity-indicator-react-native/

const ASSETS_PATH: string = "./../assets/";

interface SlideData {
    title: string;
    text: string;
    src: number; // 画像ファイルって数値型なんだ…．
}
const SLIDE_DATA: SlideData[] = [
    { title: "Step: 1", text: "Add your trip memory", src: require(ASSETS_PATH + "top1.png")},
    { title: "Step: 2", text: "All trips on the list", src: require(ASSETS_PATH + "top2.png")},
    { title: "Step: 3", text: "See the trip detail", src: require(ASSETS_PATH + "top3.png")}
];

const SCREEN_WIDTH: number = Dimensions.get("window").width;

export default class TutorialScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isInitialized: null, // チュートリアル済みかのフラグ
            animate: true // ロード中のクルクルのアニメーション稼働のフラグ
        };
    }


    async componentDidMount(): Promise<void> {
        // AsyncStorageからフラグ取得
        let isInitializedString = await AsyncStorage.getItem('isInitialized');

        if (isInitializedString === 'true') { // チュートリアル済みフラグがtrueなら
            this.setState({
                isInitialized: true,
                animate: false
            });

            // main画面にリダイレクト
            this.props.navigation.navigate("main");
        } else { // 何も無い，またはfalseなら
            this.setState({isInitialized: false});
        }
    }


    onStartButtonPress = async (): Promise<void> => {
        // チュートリアル済みのフラグをスマホにキャッシュ
        // 'async'修飾子がついた関数の中でawait修飾子がついている処理に対し，その処理が終わるまで待機する非同期処理におけるコツ
        await AsyncStorage.setItem('isInitialized', 'true');

        // このpropsとnavigationの関係は説明すると長くなるらしい，とりまエラーでも無視．
        this.props.navigation.navigate("main"); // homeでも同じ
    }
    renderLastButton(index: number): JSX.Element {
        if (index === SLIDE_DATA.length - 1) { // スタート画面の最後のスライドならば
            return (
                <Button
                    style={{padding: 10}}
                    buttonStyle={{backgroundColor: "deepskyblue"}}
                    title="Let's get it started!"
                    onPress={this.onStartButtonPress}
                />
            );
        }
    }

    /*
    ・renderに返すJSXにはスペースを含めないようにしたほうが良い．如何なるコメントアウトも書けない．エラー「Text strings must be rendered within a <Text> component」になる．
    ・Viewタグのkeyオプションは警告回避のため．
    ・3つ目のText配列のインデックスが0からなので1加算してページ番号にする．
    */
    renderSlides(): JSX.Element[] {
        return SLIDE_DATA.map((slide, index) => {
            return (
                <View
                    key={index}
                    style={styles.slideStyle}
                >
                    <View style={styles.containerStyle}>
                        <Text style={styles.textStyle}>
                            {slide.title}
                        </Text>
                        <Text style={styles.textStyle}>
                            {slide.text}
                        </Text>
                    </View>
                    <Image
                        style={{flex: 2}}
                        resizeMode="contain"
                        source={slide.src}
                    />
                    <View style={styles.containerStyle}>
                        {this.renderLastButton(index)}
                        <Text style={styles.textStyle}>
                            {index + 1} / 3
                        </Text>
                    </View>
                </View>
            );
        });
    }


    render(): JSX.Element {
        if (_.isNull(this.state.isInitialized)) { // isInitializedがnull(=画面ロード中)なら
            // return <AppLoading />; // チュートリアルで使ったロード中のやつ．
            return (
                <ActivityIndicator
                    animating={this.state.animating}
                    color="#0000aa"
                    size="large"
                    style={styles.activityIndicator}
                />
            );
        }

        return (
            <ScrollView
                horizontal={true}
                pagingEnabled={true}
                style={{ flex: 1 }}
            >
                {this.renderSlides()}
            </ScrollView>
        );
    }
}


// style属性を以下でまとめてTSXでは変数のみの記述にして短縮化．
const styles = StyleSheet.create({
    slideStyle: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "skyblue",
        width: SCREEN_WIDTH
    },
    containerStyle: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    textStyle: {
        color: "white",
        fontSize: 20,
        padding: 5
    }
});