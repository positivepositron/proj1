//budget controller
var budgetController = (function(){

    var income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    }

    var expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    }

    expense.prototype.calcPercentage= function(totalIncome){
        if(totalIncome>0)
        this.percentage=Math.round((this.value/totalIncome)*100);
        else
        this.percentag=-1;
    }

    expense.prototype.getPercentage= function(){
        return this.percentage;
    }

    var data={
        allitems:{
            inc:[],
            exp:[]
        },
        totals:{
            inc:0,
            exp:0
        },
        budget:0,
        percentage:-1
    }

    var calculateTotal= function(type){
        var sum=0;
        data.allitems[type].forEach(function(curr){
            sum=sum+curr.value;
        })
        data.totals[type]=sum;
    }

return{
    addItem: function(type,des,val){
        var newItem,ID;
        //create new ID
        if(data.allitems[type].length>0)
        ID=data.allitems[type][data.allitems[type].length-1].id+1;
        else
        ID=0;

        //create new data item 
        if(type==='inc')
        newItem=new income(ID,des,val);
        if(type==='exp')
        newItem=new expense(ID,des,val);

        //push it into data structure
        data.allitems[type].push(newItem);
        return newItem;
    },

    deleteItem: function(type,id){
        var ids,index;
        ids=data.allitems[type].map(function(current){
            return current.id;
        })
        
        index=ids.indexOf(id);

        if(index !== -1){
            data.allitems[type].splice(index,1);
        }
    },

    calculateBudget : function(){
        //calculate total income and expense
        calculateTotal('inc');
        calculateTotal('exp');

        //calculate total buddget
        data.budget=data.totals.inc-data.totals.exp;

        //calculate the percentage
        if(data.totals.inc>0)
        data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
        else
        data.percentage=-1;
    },
    
    calculatePercentages:function(){
        data.allitems.exp.forEach(function(cur){
            cur.calcPercentage(data.totals.inc);
        })
    },

    getPercentages:function(){
        var allPerc= data.allitems.exp.map(function(cur){
            return cur.getPercentage();
        })
        return allPerc;
    },

    getBudget : function(){
        return{
            budget : data.budget,
            totalInc : data.totals.inc,
            totalExp : data.totals.exp,
            percentage : data.percentage
        }     
    },

    testing: function(){
        console.log(data);
    }
}
})();

//UI controller
var UIController = (function(){

return{
    getInput:function(){
        return{
            type:document.querySelector('.add__type').value ,
            description:document.querySelector('.add__description').value ,
            value:parseFloat(document.querySelector('.add__value').value)
        };
    },
    addListItem:function(obj,type){
    
       //insert html with placeholder text
        var html , newHtml, element;
        if(type==='inc'){
            element='.income__list';
                html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }
        else if(type==='exp'){
            element='.expenses__list';
        html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
        }

        //replace placeholder text with actual values
        newHtml=html.replace('%id%',obj.id);
        newHtml=newHtml.replace('%description%',obj.description);
        newHtml=newHtml.replace('%value%',this.formatNumber(obj.value,type));


        //insert html into the DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    deleteListItem: function(selectorId){
        var el= document.getElementById(selectorId);
        el.parentNode.removeChild(el);

    },

    clearFields: function(){
        var fields,fieldsArr;
        fields=document.querySelectorAll('.add__description,.add__value');
        fieldsArr=Array.prototype.slice.call(fields);
        fieldsArr.forEach(function(current,index,array){
            current.value="";
        })
    },

    displayBudget: function(obj){
        
        document.querySelector('.budget__value').textContent=obj.budget; 
        document.querySelector('.budget__income--value').textContent=obj.totalInc;
        document.querySelector('.budget__expenses--value').textContent=obj.totalExp;
        if(obj.percentage>0)
        document.querySelector('.budget__expenses--percentage').textContent=obj.percentage+"%";
        else
        document.querySelector('.budget__expenses--percentage').textContent="--";


    },

    displayPercentages: function(percentages){
        var fields=document.querySelectorAll('.item__percentage');

        var nodeListForEach= function(list,callback){
            for(var i=0;i<list.length;i++)
            callback(list[i],i);
        };

        nodeListForEach(fields, function(current,index){
            if(percentages[index]>0)
            current.textContent=percentages[index]+'%';
            else
            current.textContent='--';
        });

        
    },

    formatNumber:function(num,type){
        num=Math.abs(num);
        num=num.toFixed(2);

        var numSplit=num.split('.');
        var int=numSplit[0];
        var dec=numSplit[1];

        if(int.length>3)
        int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        
        return (type==='exp'?'-':'+')+int+"."+dec;

    },
    displayMonth:function(){
        var now,month,year;
        now=new Date();
        month=now.getMonth();
        year=now.getFullYear();
        months=['January','February','March','April','May','June','July','August','September','October','November','December']
        document.querySelector('.budget__title--month').textContent=months[month]+' '+year;
    },

    changedType: function(){
        var nodeListForEach= function(list,callback){
            for(var i=0;i<list.length;i++)
            callback(list[i],i);
        };
        var fields=document.querySelectorAll('.add__type, .add__description, .add__value');
        nodeListForEach(fields,function(curr){
            curr.classList.toggle('red-focus');
        });

    }

};
})();

//universal controller
var controller = (function(budgetCtrl,UICtrl){

    var updateBudget=function(){

        //calculate the budget
        budgetCtrl.calculateBudget();

        //return the budget
        var budget = budgetCtrl.getBudget();

        //update the budget UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages=function(){
        //calculate percentages
        budgetCtrl.calculatePercentages();

        //read percentages from budget controller
        var percentages=budgetCtrl.getPercentages();

        //update ui
        UICtrl.displayPercentages(percentages);
    }

var setupEventListeners= function(){
   
    document.querySelector('.add__btn').addEventListener('click',ctrlAddItem );

    document.addEventListener('keypress', function(event){
        if(event.keyCode===13)
        ctrlAddItem();
    } );    

    document.querySelector('.container').addEventListener('click', ctrlDeleteItem);

    document.querySelector('.add__type').addEventListener('change',UICtrl.changedType);
}    
var ctrlAddItem= function(){
    var input,newItem;
   //get the field input data
    input = UICtrl.getInput();

    if(input.description!="" && !isNaN(input.value) && input.value>0){
   //add the item to the budget controller
    newItem=budgetCtrl.addItem(input.type, input.description, input.value);

   //update the UI
    UICtrl.addListItem(newItem,input.type);

   //clear fields
   UICtrl.clearFields();
   
   //calculate and update budget
   updateBudget();

   //update percentages
   updatePercentages();
    }
};

ctrlDeleteItem=function(event){
    var ItemId;
    ItemId=event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(ItemId){
       var splitId=ItemId.split('-');
       var type=splitId[0];
       var ID=parseInt(splitId[1]);

        //delete the item from data structure
        budgetCtrl.deleteItem(type,ID);

        //delete the item from ui
        UICtrl.deleteListItem(ItemId);

        //update data
        updateBudget();

        //update percentages
        updatePercentages();
    }
}

return{
    init: function(){
        console.log('Application has started');
        UICtrl.displayMonth();
        UICtrl.displayBudget({
            budget : 0,
            totalInc : 0,
            totalExp : 0,
            percentage : -1
        });
        setupEventListeners();
    }
};
})(budgetController,UIController);

controller.init();