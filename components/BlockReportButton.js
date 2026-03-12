import React from "react";
import { View, Button, Alert } from "react-native";

export default function BlockReportButton({ postUserId }) {
  const handleBlock = () => {
    Alert.alert("User Blocked", `You have blocked user: ${postUserId}`);
  };

  const handleReport = () => {
    Alert.alert("Report Sent", `User ${postUserId} has been reported.`);
  };

  return (
    <View style={{ flexDirection: "row", marginTop: 8 }}>
      <Button title="Report" onPress={handleReport} />
      <Button title="Block" onPress={handleBlock} />
    </View>
  );
}
