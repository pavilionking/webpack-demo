'use strict'
import React from 'react';
import Reflux from 'Reflux';
import ReactMixin from 'react-mixin';
import HelloStore from "../stores/hello-store";
import HelloAction from '../actions/hello-action';

export default class Hello extends React.Component {

  constructor(){
    super();
    this.state = {
      key: ""
    };
  }

  componentDidMount() {
    //Reflux.listenTo(HelloStore, "onFlagChange");
  }

  onFlagChange(){
    HelloAction.clickHandler();
  }

  render() {
    console.log(this.state);
    return (
      <h2 onClick={this.onFlagChange.bind(this)}>没有什么能够阻挡{this.state.key.a}</h2>
    )
  }
}

ReactMixin.onClass(Hello, Reflux.connect(HelloStore, "key"));
