//BUDGET CONTROLLER
const budgetController = (() => {
    class Expense {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
            this.percentage = -1;
        }

        calcPercentage(totalIncome) {
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
            }
            else {
                this.percentage = -1;
            }
        }

        getPercentage() {
            return this.percentage;
        }
    }

    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    }

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totalItems: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    const calcTotal = (type) => {
        let sum = 0;

        data.allItems[type].forEach((cur) => {
            sum += cur.value;
        });

        data.totalItems[type] = sum;
    };

    return {
        addItem: (type, desc, val) => {
            let newItem, ID;

            //Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val)
            }

            //Push it into the data structure
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },
        deleteItem: (type, id) => {
            let ids, index;

            ids = data.allItems[type].map((current) => {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calcBudget: () => {
            //Calculate total income and expenses
            calcTotal('exp');
            calcTotal('inc');

            //Calculate the budget: income - expenses
            data.budget = data.totalItems.inc - data.totalItems.exp;

            //Calculate the percentage of income that we spent
            if (data.totalItems.inc > 0) {
                data.percentage = Math.round((data.totalItems.exp / data.totalItems.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calcPercentages: () => {
            data.allItems.exp.forEach((cur) => {
                cur.calcPercentage(data.totalItems.inc);
            })
        },
        getBudget: () => {
            return {
                budget: data.budget,
                totalInc: data.totalItems.inc,
                totalExp: data.totalItems.exp,
                percentage: data.percentage
            }
        },
        getPercentages: () => {
            return data.allItems.exp.map((cur) => {
                return cur.getPercentage();
            });
        }
    };
})();

//UI CONTROLLER
const UIController = (() => {
    const DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        inputContainer: '.add__container',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    const formatNumber = (num, type) => {
        let numSplit, int, decimal;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        decimal = numSplit[1];

        return (type === 'exp' ? '- ' : '+ ') + int + '.' + decimal;
    };

    const nodeListForEach = (list, callback) => {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        getInput: () => {
            return {
                type: document.querySelector(DOMStrings.inputType).value, //Will be either inc or exp
                description: document.querySelector(DOMStrings.inputDescription).value, //Will be a string
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value) //Will be a number
            }
        },
        addListItem: (obj, type) => {
            let html, newHtml, element;

            //Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%">' +
                        '<div class="item__description">%description%</div>' +
                        '<div class="right clearfix">' +
                        '<div class="item__value">%value%</div>' +
                        '<div class="item__delete">' +
                        '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
            } else if (type === 'exp') {
                element = DOMStrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%">' +
                        '<div class="item__description">%description%</div>' +
                        '<div class="right clearfix">' +
                        '<div class="item__value">%value%</div>' +
                        '<div class="item__percentage">%percentage%</div>' +
                        '<div class="item__delete">' +
                        '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
            }

            //Replace the placeholder text with data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert HTML string into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        deleteListItem: (selectorID) => {
            let element;

            element = document.getElementById(selectorID);

            element.parentNode.removeChild(element);
        },
        clearFields: () => {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach((current) => {
                current.value = '';
            });

            fieldsArr[0].focus();
        },
        displayBudget: (obj) => {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: (percentages) => {
            let fields;
            fields = document.querySelectorAll(DOMStrings.expensesPercentageLabel);
            nodeListForEach(fields, (current, index) => {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            })
        },
        displayMonth: () => {
            let now, year, months, month;

            now = new Date();

            year = now.getFullYear();

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
                'September', 'October', 'November', 'December'];

            month = now.getMonth();

            document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        changedType: () => {
            let fields;

            fields = document.querySelectorAll(
                    DOMStrings.inputType + ',' +
                    DOMStrings.inputDescription + ',' +
                    DOMStrings.inputValue
            );

            nodeListForEach(fields, (cur) => {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        getDOMStrings: () => {
            return DOMStrings;
        }
    }
})();

//MAIN CONTROLLER
const controller = ((budgetCtrl, UICtrl) => {
    const setupEventListeners = () => {
        const DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.querySelector(DOM.inputContainer).addEventListener("keypress", (event) => {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    const updateBudget = () => {
        let budget;

        // 1. Calculate the budget
        budgetCtrl.calcBudget();

        // 2. Return the budget
        budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    const updatePercentage = () => {
        let percentages;

        // 1. Calculate the percentage
        budgetCtrl.calcPercentages();

        // 2. Return the percentage
        percentages = budgetCtrl.getPercentages();

        // 3. Display the percentage on the UI
        UICtrl.displayPercentages(percentages);

    };

    const ctrlAddItem = () => {
        let input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        //Check if description and value are empty or zero
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //Clear the fields
            UICtrl.clearFields();

            //Calculate and update budget and percentage
            updateBudget();
            updatePercentage();
        }
    };

    const ctrlDeleteItem = (event) => {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //Get type And Id
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //Remove from data
            budgetCtrl.deleteItem(type, ID);

            //Remove from DOM
            UICtrl.deleteListItem(itemID);

            //Update UI
            updateBudget();
            updatePercentage();
        }
    };

    return {
        init: () => {
            console.log('Application has started!');
            setupEventListeners();
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            });
        }
    }
})(budgetController, UIController);

//Init controller
controller.init();
































































