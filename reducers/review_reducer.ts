

import {
    FETCH_ALL_REVIEWS, SELECT_DETAIL_REVIEW
} from "./../types/types";

// 初期データ
const INITIAL_STATE = {
    allReviews: [],
    detailReview: []
};

// store内の共通データを最新に更新？
export default (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_ALL_REVIEWS:
            // stateのallReview項目を上書きしてstoreに返す
            return {...state, allReviews: action.payload};
        case SELECT_DETAIL_REVIEW:
            return {...state, detailReview: action.payload};
        default:
            // stateの内容を変更せずstoreに返す
            return state;
    }
};