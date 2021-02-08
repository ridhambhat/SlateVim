import React from "react";
import { darkGrayBtnStyle } from "../styles/tailwindStyles";
import { SITE_URL } from "../utils/variables";

const NavBar = ({ history }) => {
  const fbSend = () => {
    window.FB.ui({
      method: "send",
      link: `${window.location}`,
    });
  };
  return (
    <div>
      <button
        className={`${darkGrayBtnStyle}`}
        onClick={() => history.push("/")}
      >
        &lt;
      </button>

      <div id="socials" className="m-4 float-right">
        <a
          href={`whatsapp://send?text=${window.location}`}
          data-action="share/whatsapp/share"
          title="Share by Whatsapp"
        >
          <i className="fab fa-whatsapp px-2"></i>
        </a>
        <a
          href={`https://t.me/share/url?url=${window.location}`}
          title="Share by Telegram"
        >
          <i className="fab fa-telegram px-2"></i>
        </a>
        <button title="Share by Messenger" onClick={fbSend}>
          <i className="fab fa-facebook-messenger px-2"></i>
        </button>
        <a href={`sms:?&body=${window.location}`} title="Share by Text Message">
          <i className="fas fa-sms px-2"></i>
        </a>
        <a
          href={`mailto:?subject=Join me on SlateVim!&body=Here's our SlateVim group URL: ${window.location}`}
          title="Share by Email"
        >
          <i className="fas fa-envelope-square px-2"></i>
        </a>
      </div>
    </div>
  );
};

export default NavBar;
