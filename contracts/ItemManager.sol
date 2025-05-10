// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "./Item.sol";
import "./Ownable.sol";


contract ItemManager is Ownable {

    enum SupplyChainSteps {Created, Paid, Delivered}

    struct S_Item {
        Item _item;
        SupplyChainSteps _step;
        string _identifier;
    }

    mapping(uint => S_Item) public items;
    uint public index;


    event SupplyChainStep(uint _itemIndex, uint _step, address _address);

    function createItem(string memory _identifier, uint _priceInWei) public onlyOwner {
        Item item = new Item(this, _priceInWei, index);
        items[index]._item = item;
        items[index]._step = SupplyChainSteps.Created;
        items[index]._identifier = _identifier;
        emit SupplyChainStep(index, uint(items[index]._step), address(item));
        index++;
    }

    function triggerPayment(uint _index) public payable onlyOwner {
        Item item = items[_index]._item;

        require(address(item) == msg.sender, "Only items can trigger payment");
        require(item.priceInWei() == msg.value, "Payment mismatch");
        require(items[_index]._step == SupplyChainSteps.Created, "Already paid");

        items[_index]._step = SupplyChainSteps.Paid;
        emit SupplyChainStep(_index, uint(items[_index]._step), address(item));
    }

    function triggerDelivery(uint _index) public  {
        require(items[_index]._step == SupplyChainSteps.Paid, "Item not yet paid");

        items[_index]._step = SupplyChainSteps.Delivered;
        emit SupplyChainStep(_index, uint(items[_index]._step), address(items[_index]._item));
    }
}
