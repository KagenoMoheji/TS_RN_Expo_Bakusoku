import React from "react";
import {
    Text, View, ScrollView, TouchableOpacity, Image,
    Dimensions, Platform, ActivityIndicator, Modal
} from "react-native";
import {MapView} from "expo";
import Geocoder from "react-native-geocoding";
import {connect} from "react-redux";

import * as actions from "./../actions";

interface ImageInfo {
    src: number;
    imageAttached: boolean;
}

const ASSETS_PATH: string = "./../assets/";
const SCREEN_WIDTH: number = Dimensions.get("window").width;
const MAP_ZOOM_RATE: number = 15.0;

class DetailScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isMapLoaded: false, // 地図読み込み完了フラグ
            initialRegion: {
                latitude: 35.7090, // 東京都の緯度
                longitude: 139.7320, // 東京都の経度
                latitudeDelta: MAP_ZOOM_RATE, // 緯度方向のズーム度合い
                longitudeDelta: MAP_ZOOM_RATE * 2.25 // 経度方向のズーム度合い
            },
            modalVisible: false, // モーダルを表示するかのフラグ
            modalImageSrc: require(ASSETS_PATH + "image_placeholder.png") // モーダルに表示する画像
        };
    }


    async componentDidMount(): Promise<void> {
        // GoogleMapのAPIキーをセット
        Geocoder.setApiKey(/* APIキー */);
        // 国名から経度・緯度を取得
        let result = await Geocoder.getFromLocation(this.props.detailReview.country);
        // GoogleMapAPIから取得した結果を元にstateのマップ関連の変数を更新
        this.setState({
            isMapLoaded: true,
            initialRegion: {
                latitude: result.results[0].geometry.location.lat,
                longitude: result.results[0].geometry.location.lng,
                latitudeDelta: MAP_ZOOM_RATE,
                longitudeDelta: MAP_ZOOM_RATE * 2.25
            }
        });
    }


    renderImages(): JSX.Element {
        // 画像が添付されていない場合の初期値・代替画像
        const imageSrcs: ImageInfo[] = [
            {src: require(ASSETS_PATH + "image_placeholder.png"), imageAttached: false},
            {src: require(ASSETS_PATH + "image_placeholder.png"), imageAttached: false},
            {src: require(ASSETS_PATH + "image_placeholder.png"), imageAttached: false}
        ];

        // 添付されている画像の数だけ代替画像と入れ替える
        for (let i: number = 0; i < this.props.detailReview.imageSrcs.length; i++) {
            imageSrcs[i].src = this.props.detailReview.imageSrcs[i];
            imageSrcs[i].imageAttached = true;
        }

        return (
            // 横方向に並べる「flexDirection: "row"」
            <View style={{flexDirection: "row"}}>
                {imageSrcs.map((image, index) => {
                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={() => this.setState({
                                modalVisible: image.imageAttached, // 画像が添付されているならモーダル表示できる
                                modalImageSrc: image.src
                            })}
                        >
                            <Image
                                style={{height: SCREEN_WIDTH / 3, width: SCREEN_WIDTH / 3}}
                                source={image.src}
                            />
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    }

    render(): JSX.Element {
        if (!this.state.isMapLoaded) { // マップ読み込みが未完了なら
            // 読み込み中のクルクルを表示
            return (
                <View style={{flex: 1, justifyContent: "center"}}>
                    <ActivityIndicator size="large" />
                </View>
            );
        }

        return (
            <View style={{flex: 1}}>
                <Modal
                    visible={this.state.modalVisible} // モーダルを表示するかのフラグ
                    animationType="fade" // モーダルの出現アニメーション
                    transparent={false} // モーダルの背景を半透明にするか
                    onRequestClose={() => {}} // どうも必須の引数らしいが別のところでモーダルを閉じる処理を実装しているので，警告回避のため書いとく(https://github.com/hiddentao/react-native-modal-filter-picker/issues/16#issuecomment-376306124)
                >
                    <View style={{flex: 1, backgroundColor: "black"}}>
                        {/*
                        モーダルウィンドウ全体に「タッチできる透明なレイヤ」を被せて，それをPressしたらアクションを起こせるようにする．
                        */}
                        <TouchableOpacity
                            style={{flex: 1, justifyContent: "center", alignContent: "center"}}
                            onPress={() => this.setState({modalVisible: false})}
                        >
                            <Image
                                style={{height: SCREEN_WIDTH, width: SCREEN_WIDTH}}
                                source={this.state.modalImageSrc}
                            />
                        </TouchableOpacity>
                    </View>
                </Modal>
                <ScrollView>
                    <View style={{alignItems: "center", padding: 20}}>
                        <Text style={{fontSize: 30, padding: 5}}>{this.props.detailReview.country}</Text>
                        <Text style={{padding: 5}}>{this.props.detailReview.dateFrom} ~ {this.props.detailReview.dateTo}</Text>
                    </View>
                    <MapView
                        style={{height: SCREEN_WIDTH}} // マップを正方形に表示させるため，スマホの短辺の長さで設定
                        scrollEnabled={false} // 地図上でスクロールできないようにする
                        cacheEnabled={Platform.OS === "android"} // Androidならキャッシュ
                        initialRegion={this.state.initialRegion}
                    />
                    {this.renderImages()}
                </ScrollView>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        detailReview: state.review.detailReview
    };
};

export default connect(mapStateToProps, actions)(DetailScreen);