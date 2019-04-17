<template>
  <div id="app">
    <header class="header">
      <h1>Chat</h1>
      <!-- ログイン時にはフォームとログアウトボタンを表示 -->
      <div v-if="user.uid" key="login">
        [{{ user.displayName }}]
        <button type="button" @click="doLogout">ログアウト</button>
      </div>
      <!-- 未ログイン時にはログインボタンを表示 -->
      <div v-else key="logout">
        <button type="button" @click="doLogin">ログイン</button>
      </div>
    </header>

    <!--　Firebase から取得したリストを描画（トランジション付き）　-->
    <transition-group name="chat" tag="div" class="list content">
      <section v-for="{ key, name, image, message } in chat" :key="key" class="item">
        <div class="item-image">
          <img :src="image" width="40" height="40">
        </div>
        <div class="item-detail">
          <div class="item-name">{{ name }}</div>
          <div class="item-message">
            <div style="white-space:pre-wrap; word-wrap:break-word;" v-text="message"/>
          </div>
        </div>
      </section>
    </transition-group>

    <!-- 入力フォーム -->
    <form action @submit.prevent="doSend" class="form">
      <textarea v-model="input" :disabled="!user.uid" @keydown.ctrl.enter.exact.prevent="doSend"></textarea>
      <button type="submit" :disabled="!user.uid" class="send-button">送信</button>
    </form>
  </div>
</template>

<script>
// firebase モジュール
import firebase from "firebase";
export default {
  data() {
    return {
      user: {}, // ユーザー情報
      chat: [], // 取得したメッセージを入れる配列
      input: "" // 入力したメッセージ
    };
  },
  created() {
    firebase.auth().onAuthStateChanged(user => {
      this.user = user ? user : {};
      const ref_message = firebase.database().ref("message");
      if (user) {
        this.chat = [];
        // message に変更があったときのハンドラを登録
        ref_message.limitToLast(100).on("child_added", this.childAdded);
      } else {
        // message に変更があったときのハンドラを解除
        ref_message.limitToLast(100).off("child_added", this.childAdded);
      }
    });
  },
  methods: {
    // ログイン処理
    doLogin() {
      var provider = new firebase.auth.GithubAuthProvider();
      firebase.auth().signInWithPopup(provider);
    },
    // ログアウト処理
    doLogout() {
      firebase.auth().signOut();
    },
    // スクロール位置を一番下に移動
    scrollBottom() {
      this.$nextTick(() => {
        window.scrollTo(0, document.body.clientHeight);
      });
    },
    // 受け取ったメッセージをchatに追加
    // データベースに新しい要素が追加されると随時呼び出される
    childAdded(snap) {
      const message = snap.val();
      this.chat.push({
        key: snap.key,
        name: message.name,
        image: message.image,
        message: message.message
      });
      this.scrollBottom();
    },
    doSend() {
      if (this.user.uid && this.input.length) {
        // firebase にメッセージを追加
        firebase
          .database()
          .ref("message")
          .push(
            {
              message: this.input,
              name: this.user.displayName,
              image: this.user.photoURL
            },
            () => {
              this.input = ""; // フォームを空にする
            }
          );
      }
    },
    newlineConvert: function(value) {
      const str = value.replace(/(\r\n|\n|\r)/g, "<br />");
      return str;
    }
  }
};
</script>

<style>
* {
  margin: 0;
  box-sizing: border-box;
}
.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  background: #3ab383;
  margin-bottom: 1em;
  padding: 0.4em 0.8em;
  color: #fff;
  z-index: 100;
}
.content {
  margin: 0 auto;
  padding: 0 10px;
  max-width: 600px;
}
.form {
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  bottom: 0;
  height: 80px;
  width: 100%;
  background: #f5f5f5;
}
.form textarea {
  border: 1px solid #ccc;
  border-radius: 2px;
  padding: 0.5em;
  width: calc(100% - 6em);
  resize: none;
}
.list {
  margin-top: 100px;
  margin-bottom: 100px;
}
.item {
  position: relative;
  display: flex;
  align-items: flex-end;
  margin-bottom: 0.8em;
}
.item-image img {
  border-radius: 20px;
  vertical-align: top;
}
.item-detail {
  margin: 0 0 0 1.4em;
}
.item-name {
  font-size: 75%;
}
.item-message {
  position: relative;
  display: inline-block;
  padding: 0.8em;
  background: #deefe8;
  border-radius: 4px;
  line-height: 1.2em;
}
.item-message::before {
  position: absolute;
  content: " ";
  display: block;
  left: -16px;
  bottom: 12px;
  border: 4px solid transparent;
  border-right: 12px solid #deefe8;
}
button {
  border: none;
  border-radius: 5px;
  background-color: #deefe8;
  padding: 0.5em;
}
/* トランジション用スタイル */
.chat-enter-active {
  transition: all 1s;
}
.chat-enter {
  opacity: 0;
  transform: translateX(-1em);
}
button, input, select, textarea {
  font-family : inherit;
  font-size   : 100%;
}
</style>
