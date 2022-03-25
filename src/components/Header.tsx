import React from "react";
import logo from "../../src/logo.svg";

class Header extends React.Component {
  render() {
    return (
      <header>
        <img src={logo} className="app-logo" alt="logo" />
        <h1>Mushroom Cloud NFT</h1>
      </header>
    );
  }
}

export default Header;
