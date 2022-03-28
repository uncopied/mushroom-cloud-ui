import React from "react";
import logo from "../../src/logo.svg";

class Logo extends React.Component {
  render() {
    return (
      <div>
        <img src={logo} className="app-logo" alt="logo" />
        <h1>Mushroom Cloud NFT</h1>
      </div>
    );
  }
}

export default Logo;
