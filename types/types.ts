export interface Review {
    country: string;
    dateFrom: string;
    dateTo: string;
    imageSrcs: number[];
    rank: string;
}

export interface Rank {
    name: string;
    color: string;
    index: number;
}
export const GREAT: Rank = {name: "sentiment-very-satisfied", color: "red", index: 1};
export const GOOD: Rank = {name: "sentiment-satisfied", color: "orange", index: 2};
export const POOR: Rank = {name: "sentiment-dissatisfied", color: "blue", index: 3};


export const FETCH_ALL_REVIEWS: string = "fetch_all_reviews";
export const SELECT_DETAIL_REVIEW: string = "select_detail_review";

// export const ASSETS_PATH: string = "./../assets/"; // なぜかこちらから読み込ませるとエラーになるので各ファイル(actions/review_action.ts，screens/Tutorial.tsx，screens/Detail.tsxなど)で定義．
