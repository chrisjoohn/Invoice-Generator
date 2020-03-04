let nameInput, addressInput, db, getData;
let renderDetails = id => {
    $('#invoice-holder').hide();
  db.collection("orders")
    .doc(id)
    .get()
    .then( doc => {
        if(doc.exists){

            let invoiceDetailsContainer = document.getElementById('invoice-details');
            $(invoiceDetailsContainer).show()
            let name = doc.data().name;
            let address = doc.data().address;
            let orders = doc.data().orders;
            let invoiceNumber = doc.data().invoiceNumber;

            $('#invoice-field').html(invoiceNumber);
            $('#name-field').html(name);
            $('#address-field').html(address);

            $('#order-table').html("");


            let thead = document.createElement('tr');
            $(thead).html("<th>Description</th><th>Unit cost</th><th>Quantity</th><th>Amount</th></tr>");
            let total=0;

            $('#order-table').append(thead);
            orders.forEach( element => {
                console.log(typeof(parseFloat(element.amount)));
                if(parseFloat(element.amount)){
                    total += parseFloat(element.amount);
                }
                let orderElement = document.createElement('tr');
                $(orderElement).html("<td>"+element.item+"</td><td>"+element.cost+"</td><td>"+element.quantity+"</td><td>"+element.amount+"</td>")
                $('#order-table').append(orderElement);
            });
            console.log("total" , total);

            $('#total').html(total + " pesos");

        }else{
            console.log("awit");
        }
    });
};

let deleteEntry = id => {
    db.collection("orders")
      .doc(id)
      .delete()
      .then(() => {
        let tblRows = $("#invoice-tbl");
        tblRows.empty();
        tblRows.html(
          "<tr><th>Client name</th><th>Address</th><th>Invoice number</th></tr>"
        );
        alert('Successfully deleted an entry');
        getData();
      });
}

let populateUpdateTable = (orders) => {
    $('#invoice-items-update').html('<tr><th>Description</th><th>Unit cost</th><th>Quantity</th><th>Amount</th></tr>');

    orders.forEach(element => {
        let trElement = document.createElement('tr');
        $('#invoice-items-update').append($(trElement).html("<td><input value='"+element.item+"' type='text' class='item' /></td><td><input value='"+element.cost+"' class='cost' type='number'/></td><td><input value='"+element.quantity+"' class='quantity' type='number'/></td><td><input value='"+element.amount+"' class='amount' type='number' /></td>"));
    });
}

let editEntry = id => {
    console.log(id);
    let updateBtn = document.getElementById('updateButton');
    updateBtn.setAttribute('onclick', 'updateInvoice("'+id+'")');
    show('update');
    db.collection("orders")
      .doc(id)
      .get()
      .then( (doc) => {
          let name = doc.data().name;
          let address = doc.data().address;
          let orders = doc.data().orders;
          let invoiceNumber = doc.data().invoiceNumber;

          $('#nameUpdate').val(name);
          $('#addressUpdate').val(address);

          populateUpdateTable(orders);


      });
}
document.addEventListener("DOMContentLoaded", function() {
    let app = firebase.app();
    db = app.firestore();

    nameInput = document.getElementById('name');
    addressInput = document.getElementById('address');

    

    let renderTableRow = (invoiceNumber, name, address, id) => {
        let tbl = document.getElementById('invoice-tbl');

        let trElement = document.createElement('tr');
        $(trElement).html('<td>'+name+'</td><td>'+address+'</td><td><a href=\'javascript:renderDetails("'+id+'")\'>'+invoiceNumber+'</a></td><td><button onclick=\'deleteEntry("'+id+'")\'>Delete</button><button onclick=\'editEntry("'+id+'")\'>Update</button></td>');

        tbl.appendChild(trElement);
    }

    getData = () => {
        $('#invoice-tbl').html("loading...");
        db.collection("orders")
          .orderBy("invoiceNumber")
          .onSnapshot(snapshot => {
            let tbl = document.getElementById('invoice-tbl');
            tbl.innerHTML = "";
            let thead = document.createElement('tr');
            $(thead).html("<th>Client name</th><th>Address</th><th>Invoice number</th><th>Manage</th></tr>");
            tbl.appendChild(thead);
            snapshot.forEach(element => {
                let invoiceNumber = element.data().invoiceNumber;
                let name = element.data().name;
                let address = element.data().address;
                let orders = element.data().orders;
                let id = element.id;

                renderTableRow(invoiceNumber, name, address, id);
            });
          });
    }

    getData();

});

let addRow = () => {
    let tableElement = document.getElementById('invoice-items-holder');

    let trElement = document.createElement('tr');
    // $(trElement).html('<td><input  type="text" placeholder="Item Description"/></td> <td><input type="text" placeholder="Unit Cost" /></td> <td><input type="text" placeholder="Quantity"/></td><td><input type="text" placeholder="Amount"/></td><td><button>delete</button></td>');

    $(trElement).html('<td><input class="item" type="text" placeholder="Item Description"/></td> <td><input class="cost" type="number" placeholder="Unit Cost" /></td> <td><input class="quantity" type="number" placeholder="Quantity"/></td><td><input class="amount" type="number" placeholder="Amount"/></td>');
    tableElement.appendChild(trElement);
}

let removeInputs = () =>{
    $('#invoice-items-holder').html("<tr><td>Description</td><td>Unit cost</td><td>Quantity</td><td>Amount</td></tr>")
    $('#name').val("");
    $('#address').val("");
}


let submitOrder = () => {
    let itemClass = document.getElementsByClassName('item');
    let items = [].map.call(itemClass, (input) => {
        return input.value;
    });

    let costClass = document.getElementsByClassName('cost');
    let costs = [].map.call(costClass, (input) => {
        return input.value;
    });

    let quantityClass = document.getElementsByClassName('quantity');
    let quantities = [].map.call(quantityClass, (input) => {
        return input.value;
    });

    let amountClass = document.getElementsByClassName('amount');
    let amounts = [].map.call(amountClass, (input) => {
        return input.value;
    });

    
    let orderObjects = [];

    for(let i = 0; i< items.length; i++){
        let object = {
            item: items[i],
            cost: costs[i],
            quantity: quantities[i],
            amount: amounts[i]
        }

        orderObjects.push(object);
    }

    let name = nameInput.value;
    let address = addressInput.value;

    // let invoice = {
    //     name: name,
    //     address: address,
    //     orders: orderObjects,
    //     invoiceNumber: new Date().getTime()
    // }

    $('#submitBtn').prop('disabled', true);
    db.collection('orders').add({
        name: name,
        address: address,
        orders: orderObjects,
        invoiceNumber : new Date().getTime()
    }).then( () => {
        $('#submitBtn').prop('disabled', false);
        alert('Successfully submitted your order ');
        show('invoices');
        removeInputs();
    }).catch( (error) => {
        console.log(error);
    })
}

let show = container => {
    if (container == 'create'){
        $('#create-invoice').show();
        $('#invoice-holder').hide();
        $('#invoice-details').hide();
        $('#update-invoice').hide();
    }else if (container == 'invoices'){
        $('#invoice-holder').show();
        $('#create-invoice').hide();
        $('#invoice-details').hide();
        $('#update-invoice').hide();
    }else if(container == 'update'){
        $('#invoice-holder').hide();
        $('#create-invoice').hide();
        $('#invoice-details').hide();
        $('#update-invoice').show();
    }
}

let updateInvoice = id => {
    
    let itemClass = document.getElementsByClassName('item');
    let items = [].map.call(itemClass, (input) => {
        return input.value;
    });

    let costClass = document.getElementsByClassName('cost');
    let costs = [].map.call(costClass, (input) => {
        return input.value;
    });

    let quantityClass = document.getElementsByClassName('quantity');
    let quantities = [].map.call(quantityClass, (input) => {
        return input.value;
    });

    let amountClass = document.getElementsByClassName('amount');
    let amounts = [].map.call(amountClass, (input) => {
        return input.value;
    });

    
    let orderObjects = [];

    for(let i = 0; i< items.length; i++){
        let object = {
            item: items[i],
            cost: costs[i],
            quantity: quantities[i],
            amount: amounts[i]
        }

        orderObjects.push(object);
    }

    
    let name = document.getElementById('nameUpdate').value;
    let address = document.getElementById('addressUpdate').value;

    $('#updateButton').prop('disabled', true);
    db.collection('orders').doc(id).set({
        name: name,
        address: address,
        orders: orderObjects,
        invoiceNumber : new Date().getTime()
    }).then( () => {

        $('#updateButton').prop('disabled', false);
        alert('Order successfully updated!');
        show('invoices');
    }).catch( (error) => {
        console.log(error);
    });
}


let addRowUpdate = () => {
    let tableElement = document.getElementById('invoice-items-update');

    let trElement = document.createElement('tr');
    // $(trElement).html('<td><input  type="text" placeholder="Item Description"/></td> <td><input type="text" placeholder="Unit Cost" /></td> <td><input type="text" placeholder="Quantity"/></td><td><input type="text" placeholder="Amount"/></td><td><button>delete</button></td>');

    $(trElement).html('<td><input class="item" type="text" placeholder="Item Description"/></td> <td><input class="cost" type="number" placeholder="Unit Cost" /></td> <td><input class="quantity" type="number" placeholder="Quantity"/></td><td><input class="amount" type="number" placeholder="Amount"/></td>');
    tableElement.appendChild(trElement);
}