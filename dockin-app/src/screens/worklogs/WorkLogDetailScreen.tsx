import React, { useCallback, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Screen } from "@/src/components/common/Screen";
import { AppCard } from "@/src/components/common/AppCard";
import { AppButton } from "@/src/components/common/AppButton";
import { AppInput } from "@/src/components/common/AppInput";
import { LoadingState } from "@/src/components/common/LoadingState";
import { useAsyncData } from "@/src/hooks/useAsyncData";
import { workLogService } from "@/src/services/workLogService";
import { theme } from "@/src/theme/theme";
import { useAuthStore } from "@/src/store/authStore";
import type { WorkLogComment } from "@/src/types";
import type { RootStackParamList } from "@/src/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "WorkLogDetail">;

export function WorkLogDetailScreen({ navigation, route }: Props) {
  const role = useAuthStore((state) => state.role);
  const loadDetail = useCallback(() => workLogService.getWorkLogDetail(route.params.logId), [route.params.logId]);
  const { data, loading, error } = useAsyncData(loadDetail);
  const loadComments = useCallback(() => workLogService.getComments(route.params.logId), [route.params.logId]);
  const comments = useAsyncData(loadComments);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);

  const handleDelete = async () => {
    await workLogService.deleteWorkLog(route.params.logId);
    Alert.alert("삭제 완료", "작업일지가 삭제되었습니다.", [{ text: "확인", onPress: () => navigation.goBack() }]);
  };

  const handleSaveComment = async () => {
    if (!commentText.trim()) return;
    if (editingCommentId) {
      await workLogService.updateComment(route.params.logId, editingCommentId, commentText.trim());
    } else {
      await workLogService.createComment(route.params.logId, commentText.trim());
    }
    setCommentText("");
    setEditingCommentId(null);
    await comments.reload();
  };

  const handleDeleteComment = async (commentId: number) => {
    await workLogService.deleteComment(route.params.logId, commentId);
    await comments.reload();
  };

  return (
    <Screen>
      {loading ? <LoadingState /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {data ? (
        <AppCard style={styles.card}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.meta}>{data.authorName ?? data.userId}</Text>
          <Text style={styles.meta}>{new Date(data.createdAt).toLocaleString()}</Text>
          <Text style={styles.body}>{data.logText}</Text>
          {data.audioFileUrl ? <Text style={styles.file}>첨부 음성: {data.audioFileUrl}</Text> : null}
          {data.imageUrl ? <Text style={styles.file}>첨부 이미지: {data.imageUrl}</Text> : null}
          {role === "ADMIN" ? (
            <View style={styles.buttons}>
              <AppButton label="수정" variant="secondary" onPress={() => navigation.navigate("WorkLogEditor", { mode: "edit", logId: data.logId })} />
              <AppButton label="삭제" variant="danger" onPress={handleDelete} />
            </View>
          ) : null}
        </AppCard>
      ) : null}
      <AppCard style={styles.card}>
        <Text style={styles.sectionTitle}>관리자 댓글</Text>
        {comments.loading ? <LoadingState /> : null}
        {comments.data?.map((item: WorkLogComment) => (
          <View key={item.commentId} style={styles.commentBox}>
            <Text style={styles.commentMeta}>{item.userId} · {new Date(item.updatedAt).toLocaleString()}</Text>
            <Text style={styles.commentBody}>{item.content}</Text>
            {role === "ADMIN" ? (
              <View style={styles.commentActions}>
                <AppButton
                  label="수정"
                  variant="secondary"
                  onPress={() => {
                    setEditingCommentId(item.commentId);
                    setCommentText(item.content);
                  }}
                  style={styles.commentButton}
                />
                <AppButton label="삭제" variant="danger" onPress={() => handleDeleteComment(item.commentId)} style={styles.commentButton} />
              </View>
            ) : null}
          </View>
        ))}
        {!comments.loading && !comments.data?.length ? <Text style={styles.empty}>댓글이 없습니다.</Text> : null}
        {role === "ADMIN" ? (
          <>
            <AppInput label={editingCommentId ? "댓글 수정" : "댓글 작성"} value={commentText} onChangeText={setCommentText} placeholder="관리자 피드백 입력" multiline />
            <AppButton label={editingCommentId ? "댓글 수정 저장" : "댓글 등록"} onPress={handleSaveComment} />
          </>
        ) : null}
      </AppCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 14 },
  title: { fontSize: 28, fontWeight: "800", color: theme.colors.text },
  meta: { color: theme.colors.subText },
  body: { color: theme.colors.text, fontSize: 16, lineHeight: 26, marginTop: 8 },
  file: { color: theme.colors.primary, fontWeight: "600" },
  buttons: { gap: 12, marginTop: 12 },
  sectionTitle: { fontSize: 20, fontWeight: "800", color: theme.colors.text },
  commentBox: {
    padding: 14,
    borderRadius: theme.radius.md,
    backgroundColor: "#F7FAFE",
    gap: 8,
  },
  commentMeta: { color: theme.colors.subText, fontSize: 12 },
  commentBody: { color: theme.colors.text, lineHeight: 22 },
  commentActions: { flexDirection: "row", gap: 10 },
  commentButton: { flex: 1 },
  empty: { color: theme.colors.subText },
  error: { color: theme.colors.danger },
});
