import Reflux  from "Reflux";
import HelloAction from "../actions/hello-action";

export default Reflux.createStore({

  flag: true,

  listenables: [HelloAction],

  onClickHandler() {
    this.flag = this.flag ? false : true;
    console.log(this.flag);
    this.trigger({flag: this.flag, a:"abcddd"});
  }
})

