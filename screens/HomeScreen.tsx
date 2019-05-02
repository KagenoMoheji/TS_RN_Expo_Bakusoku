import React from "react";
import {View} from "react-native";
import {ButtonGroup, ListItem} from "react-native-elements";
import {ScrollView} from "react-native-gesture-handler";
import {MaterialIcons} from "@expo/vector-icons";
import {connect} from "react-redux";

import * as actions from "../actions";
import {Review, Rank} from "../types/types";

const ALL: Rank = {name: "all", color: "", index: 0};
const GREAT: Rank = {name: "sentiment-very-satisfied", color: "red", index: 1};
const GOOD: Rank = {name: "sentiment-satisfied", color: "orange", index: 2};
const POOR: Rank = {name: "sentiment-dissatisfied", color: "blue", index: 3};

class HomeScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedIndex: ALL["index"], // buttonListで選択されているインデックス
        };
    }


    componentDidMount(): void {
        // Action creatorを呼ぶ
        this.props.fetchAllReviews();
    }


    onButtonGroupPress = (selectedIndex: number): void => {
        this.setState({
            selectedIndex: selectedIndex
        });
    }

    onListItemPress = (selectedReview: Review) => {
        // Action creatorを発動する
        this.props.selectDetailReview(selectedReview);

        this.props.navigation.navigate("detail");
    }

    renderReviews(): JSX.Element {
        let reviewRank: string;

        switch (this.state.selectedIndex) {
            case GREAT["index"]:
                reviewRank = GREAT["name"];
                break;
            case GOOD["index"]:
                reviewRank = GOOD["name"];
                break;
            case POOR["index"]:
                reviewRank = POOR["name"];
                break;
            default:
                break;
        }

        // let rankedReviews: Review[] = [];
        // if (this.state.selectedIndex === ALL["index"]) {
        //     rankedReviews = this.props.allReviews;
        // } else {
        //     for (let i: number = 0; i < this.props.allReviews.length; i++) {
        //         if(this.props.allReviews[i].rank === reviewRank) {
        //             rankedReviews.push(this.props.allReviews[i]);
        //         }
        //     }
        // }
        // 上記は下記のようにfilter()で書ける．
        let rankedReviews: Review[] = (() => {
            if (this.state.selectedIndex === ALL["index"]) {
                return this.props.allReviews;
            } else {
                return this.props.allReviews.filter((review) => {
                    return review.rank === reviewRank;
                });
            }
        })();

        return (
            <ScrollView>
                {rankedReviews.map((review, index) => {
                    let reviewColor;
                    switch (review.rank) {
                        case GREAT["name"]:
                            reviewColor = GREAT["color"];
                            break;
                        case GOOD["name"]:
                            reviewColor = GOOD["color"];
                            break;
                        case POOR["name"]:
                            reviewColor = POOR["color"];
                            break;
                        default:
                            break;
                    }

                    return (
                        <ListItem
                            key={index}
                            // leftIcon={{name: review.rank, color: reviewColor}}
                            // Expoでなければ上記で正常に動作するだろうが，
                            // https://react-native-training.github.io/react-native-elements/docs/listitem.html#listitem-implemented-with-custom-view-for-subtitle
                            // Expoなので上記リンクを参考に「@expo/vector-icons」で代替法を以下のように実装．
                            leftIcon = {
                                <MaterialIcons
                                    name={review.rank}
                                    size={40}
                                    color={reviewColor}
                                />
                            }
                            title={review.country}
                            subtitle={`${review.dateFrom} ~ ${review.dateTo}`}
                            onPress={() => this.onListItemPress(review)}
                        />
                    );
                })}
            </ScrollView>
        );
    }

    render(): JSX.Element {
        let nGreat: number = 0,
            nGood: number = 0,
            nPoor: number = 0;
        for (let i: number = 0; i < this.props.allReviews.length; i++) {
            switch (this.props.allReviews[i].rank) {
                case GREAT["name"]:
                    nGreat++;
                    break;
                case GOOD["name"]:
                    nGood++;
                    break;
                case POOR["name"]:
                    nPoor++;
                    break;
                default:
                    break;
            }
        }

        const buttonList = [
            `All (${this.props.allReviews.length})`,
            `Great (${nGreat})`,
            `Good (${nGood})`,
            `Poor (${nPoor})`
        ];

        return (
            <View style={{flex: 1}}>
                <ButtonGroup
                    buttons={buttonList}
                    selectedIndex={this.state.selectedIndex}
                    onPress={this.onButtonGroupPress}
                />
                {this.renderReviews()}
            </View>
        );
    }
}

// mapStateToPropsがHomeScreenとStore(≒Reducer)の橋渡しをする？
const mapStateToProps = (state) => {
    return {
        allReviews: state.review.allReviews
    };
};

// connectがmapStateToPropsとAction creatorを紐づけ(結果的にReducerとAction creatorが紐づけされてる)？
export default connect(mapStateToProps, actions)(HomeScreen);


/*
Reduxについて，Expo上では「_react[“default”].memo is not a function.」とエラーが出た．
https://forums.expo.io/t/react-default-memo-is-not-a-function/21623
https://stackoverflow.com/a/55771537
そこで上記リンクを参考にreact-redux@6.0.0にダウングレードし，「./../node_modules/.bin/expo r -c」で
キャッシュクリアしたらうまくいった．
*/