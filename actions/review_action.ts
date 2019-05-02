import {AsyncStorage} from "react-native";
import _ from "lodash";

import {
    FETCH_ALL_REVIEWS, SELECT_DETAIL_REVIEW
} from "./../types/types"; // 型定義のインポート

// Action creatorを作成
export const fetchAllReviews = () => {
    return async (dispatch): Promise<void> => {
        // AsyncStorageから評価リストを取得
        let stringifiedAllReviews = await AsyncStorage.getItem('allReviews');
        // 取得した評価リストはJSON形式なので，TypeScriptで扱える連想配列に変換
        let allReviews = JSON.parse(stringifiedAllReviews);

        if (_.isNull(allReviews)) { // 評価リストが無かったら
            // 空の配列にしてAsyncStorageに格納
            allReviews = [];
            await AsyncStorage.setItem('allReviews', JSON.stringify(allReviews));
        }

        // 上記の非同期処理が終わったら実行
        // Reducerに渡すtypeとpayloadを指定(review.areducer.tsに引数を渡してその戻り値を取得している)
        dispatch({type: FETCH_ALL_REVIEWS, payload: allReviews});
    };
};

export const selectDetailReview = (selectedReview) => {
    // 引数に受け取った値(selectedReview)を横流しするだけ
    return {type: SELECT_DETAIL_REVIEW, payload: selectedReview};
};
