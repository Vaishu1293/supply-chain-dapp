import React, { Component } from "react";
import ItemManager from "./contracts/ItemManager.json";
import getWeb3 from "./getWeb3";
import "./styles.css";

class App extends Component {
  state = {
    cost: 0,
    itemName: "exampleItem1",
    loaded: false,
    items: [],
  };

  componentDidMount = async () => {
    try {
      this.web3 = await getWeb3();
      this.accounts = await this.web3.eth.getAccounts();
      const networkId = await this.web3.eth.net.getId();

      this.itemManager = new this.web3.eth.Contract(
        ItemManager.abi,
        ItemManager.networks[networkId] && ItemManager.networks[networkId].address
      );

      this.listenToPaymentEvent();
      await this.fetchItems();
      this.setState({ loaded: true });
    } catch (error) {
      alert("Failed to load Web3, accounts, or contract.");
      console.error(error);
    }
  };

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = async () => {
    const { cost, itemName } = this.state;
    let result = await this.itemManager.methods
      .createItem(itemName, cost)
      .send({ from: this.accounts[0] });

    alert("Send " + cost + " Wei to this address: " + result.events.SupplyChainStep.returnValues._address);
    await this.fetchItems();
  };

  listenToPaymentEvent = () => {
    this.itemManager.events.SupplyChainStep().on("data", async (event) => {
      if (event.returnValues._step === "1") {
        const itemIndex = event.returnValues._itemIndex;
        const itemObj = await this.itemManager.methods.items(itemIndex).call();
        alert(`✅ Payment received for item "${itemObj._identifier}". Please proceed with delivery.`);
        await this.fetchItems();
      }
    });
  };

  fetchItems = async () => {
    const index = await this.itemManager.methods.index().call();
    const items = [];

    for (let i = 0; i < index; i++) {
      const item = await this.itemManager.methods.items(i).call();
      items.push({ ...item, index: i });
    }

    this.setState({ items });
  };

  handleDeliver = async (index) => {
    await this.itemManager.methods.triggerDelivery(index).send({
      from: this.accounts[0],
    });
    alert(`📦 Item #${index} marked as Delivered.`);
    await this.fetchItems();
  };

  renderStatus = (step) => {
    switch (parseInt(step)) {
      case 0:
        return "Created";
      case 1:
        return "Paid";
      case 2:
        return "Delivered";
      default:
        return "Unknown";
    }
  };

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    return (
      <div className="App">
        <h1>Supply Chain DApp</h1>
        <h2>Create New Item</h2>

        <label>Cost in Wei: </label>
        <input
          type="number"
          name="cost"
          value={this.state.cost}
          onChange={this.handleInputChange}
        />

        <label> Item Name: </label>
        <input
          type="text"
          name="itemName"
          value={this.state.itemName}
          onChange={this.handleInputChange}
        />

        <button type="button" onClick={this.handleSubmit}>
          Create Item
        </button>

        <hr />

        <h2>Item List</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>#</th>
              <th>Identifier</th>
              <th>Status</th>
              <th>Contract Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {this.state.items.map((item) => (
              <tr key={item.index}>
                <td>{item.index}</td>
                <td>{item._identifier}</td>
                <td>{this.renderStatus(item._step)}</td>
                <td>{item._item}</td>
                <td>
                  {parseInt(item._step) === 1 && (
                    <button onClick={() => this.handleDeliver(item.index)}>
                      Deliver
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
