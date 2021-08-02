// подключение
const {
  renderFile
} = require("ejs");
const express = require("express");
const app = express();

const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

// ejs
app.set('view engine', 'ejs');

// heroku
app.listen(process.env.PORT);

// ▼▼▼▼ body-parser ▼▼▼▼, теперь его не нужно импортировать отдельно, достаточно написать такой код:
app.use(express.urlencoded({
  extended: true
}));


// ▼▼▼▼ подключил css ▼▼▼▼
app.use(express.static(__dirname + '/public'));

// подключение Lodash
var _ = require('lodash');

// mongoose ВАЖНО ПОСЛЕ 27017 УКАЗЫВАЕТСЯ НАЗВАНИЕ DATABASE. В МОЕМ СЛУЧАЕ БЫЛО test, далее я изменю его на todolistDB. РАНЕЕ ИЗ ЗА ЭТОГО Я ЖЕСТКО ЗАТУПИЛ И НЕ МОГ ПОНЯТЬ КУДА СОХРАНЯЮТСЯ ЛЮДИ(person). А ОКАЗЫВАЕТСЯ ОНИ СОХРАНЯЛИСЬ В БАЗУ ФРУКТОВ(fruitsDB), и внутри fruitsDB уже были people. то есть это была не отдельная база.
// А ИМЕННО БАЗА ИЗНАЧАЛЬНО УКАЗЫВАЕТСЯ ЗДЕСЬ
const mongoose = require("mongoose");
mongoose.connect('mongodb+srv://admin-BK201:88@cluster0.llwk1.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// items collections
const itemSchema = new mongoose.Schema({
  name: String
});


const Item = mongoose.model('Item', itemSchema);

const item1 = new Item({
  name: 'Welcome! This is ToDoList.'
});

const item2 = new Item({
  name: 'Click the + button to add a new item'
});

const item3 = new Item({
  name: '<- Click here to delete an item.'
});

const defaultItems = [item1, item2, item3];


// listSchema

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model('List', listSchema);

// get
app.get("/", function (req, res) {

  Item.find((err, foundItems) => {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully saved all the items to itemsDB");
        }
      });

      res.redirect('/');

    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }

  });

});



// get params
app.get('/:customListName', (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, (err, foundList) => {

    if (!err) {

      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);

      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });

      }

    }
  });


});



// post
app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    newItem.save();

    res.redirect('/');
  } else {
    List.findOne({
      name: listName
    }, (err, foundList) => {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});


// post delete
app.post("/delete", function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log(err);
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItemId
        }
      }
    }, (err, foundList) => {
      if (!err) {
        res.redirect("/" + listName);
      }
    });

  }



});




// get about
app.get("/about", function (req, res) {
  res.render("about");
});