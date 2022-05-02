import React from "react";
import Avatar from "react-avatar";

import useUser from "../../hooks/UserContext";
import Dropdown from "../Dropdown";

import * as styles from "./UserDropdown.module.scss";
import * as dropdownStyles from "../Dropdown.module.scss";

export default function UserDropdown() {
  const { currentUser, logUserOut } = useUser();

  const avatar = () => (
    <div className={styles.Avatar}>
      <Avatar
        src={currentUser.img}
        name={currentUser.username}
        size="30px"
        round="30px"
      />
      <span className={styles.Caret} aria-hidden>
        ▾
      </span>
    </div>
  );

  return (
    <Dropdown
      triggerButton={avatar()}
      wrapperClass={styles.UserDropdownWrapper}
      triggerButtonClass={styles.UserDropdown}
      openOnHover={true}
    >
      <div className={styles.UserDropdownList}>
        <span className={styles.UserInfo}>
          Address:{" "}
          {currentUser.address.slice(0, 5) +
            "..." +
            currentUser.address.slice(-4)}
        </span>
        <button onClick={logUserOut} className={dropdownStyles.Button}>
          logout
        </button>
      </div>
    </Dropdown>
  );
}
