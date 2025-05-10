const ItemManager = artifacts.require("ItemManager");

contract("ItemManager", accounts => {
  it("should create an item correctly", async () => {
    const itemManagerInstance = await ItemManager.deployed();
    const itemName = "TestItem1";
    const itemPrice = 500;

    const result = await itemManagerInstance.createItem(itemName, itemPrice, {
      from: accounts[0],
    });

    // Check that the item index returned is 0
    assert.equal(result.logs[0].args._itemIndex.toNumber(), 0, "Item index should be 0");

    // Verify item details stored in contract
    const item = await itemManagerInstance.items(0);
    assert.equal(item._identifier, itemName, "Stored item name is incorrect");
    assert.equal(item._priceInWei.toString(), itemPrice, "Stored price is incorrect");
  });
});
