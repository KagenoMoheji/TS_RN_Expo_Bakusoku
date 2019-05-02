import React from "react";
import {Text, View} from "react-native";
import {Button} from "react-native-elements";

export default class Setting1Screen extends React.Component {
    render(): JSX.Element {
        return (
            <View style={{flex: 1, justifyContent: "center"}}>
                <Text>This is Setting1Screen</Text>

                <Button
                    title="Go to Setting2"
                    onPress={() => this.props.navigation.navigate("setting2")}
                />
            </View>
        );
    }
}