/**
 * Created by Pietro Polsinelli && Matteo Bicocchi on 15/05/2015.
 *
 * See this extended blog post and video to learn about this: []
 *
 * Follow us on Twitter @ppolsinelli @pupunzi where we post about game design, game development, Unity3d 2D, HTML5, CSS3, jquery, applied games.
 *
 */

/**
 *
 * @param behaviourTree
 * @param actor
 * @param numberOfLoops 0 forever
 * @constructor
 */


function PlotState(plotTree, numberOfLoops) {

	if (typeof numberOfLoops == "undefined")
		numberOfLoops = 1;

	this.plotTree = plotTree;
	this.nodeAndState = [];
	this.currentNode = null;
	this.numberOfLoops = numberOfLoops;

	this.nodeResult = null;
	
	this.numberOfRuns = 0;
	this.finished = false;

	this.findStateForNode = function (node) {

		for (var i = 0; i < this.nodeAndState.length; i++) {
			if (this.nodeAndState[i][0] == node)
				return this.nodeAndState[i][1];
		}
	};

	this.setState = function (state, node) {

		if (typeof node == "undefined")
			node = this.currentNode;

		for (var i = 0; i < this.nodeAndState.length; i++) {
			if (this.nodeAndState[i][0] == node) {
				this.nodeAndState.splice(i, 1);
				break;
			}
		}
		this.nodeAndState.push([node, state]);

		return state;
	};

	//commodity methods
	this.executing = function () {
		this.setState(PlotState.STATE_EXECUTING);
	};

	this.hasToStart = function () {
		var state = this.findStateForNode(this.currentNode);
		return state == PlotState.STATE_TO_BE_STARTED;
	};

	this.complete = function (result) {

		if(typeof result != "undefined")
			this.nodeResult = result;

		console.debug("this.complete ",this.nodeResult);

			this.setState(PlotState.STATE_COMPUTE_RESULT);
	};

	/**
	 * This is the function that crawls the behaviour tree instance you pass to it
	 * and calls the executors if the the argument is a node of some kind,
	 * calls it as an action otherwise.
	 *
	 * The same node may be called to execute twice, once for starting it and on a subsequent tick for completion.
	 */
	this.tellMe  = function (result, forceNodeName) {

		if(result)
			this.nodeResult = result;

		if (this.finished)
			return;

		//find current node to be executed, or a running one, or root to launch, or root completed
		this.currentNode = this.findCurrentNode(this.plotTree);

		if (this.currentNode == null) {
			this.numberOfRuns++;
			if (this.numberOfLoops == 0 || this.numberOfRuns < this.numberOfLoops) {
				this.nodeAndState = [];
				this.currentNode = this.findCurrentNode(this);
			} else {

				this.finished = true;
				return;
			}
		}

	 this.currentNode.execute(this);

	};


	// This is a recursive function, does a lot of work in few lines of code.
	// Finds in the behaviour tree instance the currend node that is either to be
	// executed or is executing (async). Also marks all parent nodes completed
	// when necessary.
	this.findCurrentNode = function(node) {

		var state = this.findStateForNode(node);

		if (state == PlotState.STATE_DISCARDED)
			return null;

		if (state == null) {
			state = this.setState(PlotState.STATE_TO_BE_STARTED, node);
		}

		if (
        state == PlotState.STATE_EXECUTING ||
				state == PlotState.STATE_COMPUTE_RESULT ||
				state == PlotState.STATE_TO_BE_STARTED
				)
			return node;

		var children = node.children();

		if (children == null) {

			return null;

        } else {

			for (var i = 0; i < children.length; i++) {
				var childNode = this.findCurrentNode(children[i]);
				if (childNode)
					return childNode;
			}

			if (state == PlotState.STATE_WAITING) {
				this.setState(PlotState.STATE_COMPLETED, node);
			}
		}

        return null;
	};
}

PlotState.STATE_TO_BE_STARTED = "STATE_TO_BE_STARTED";
PlotState.STATE_WAITING = "STATE_WAITING";
PlotState.STATE_DISCARDED = "STATE_DISCARDED";
PlotState.STATE_EXECUTING = "STATE_EXECUTING";
PlotState.STATE_COMPUTE_RESULT = "STATE_COMPUTE_RESULT";
PlotState.STATE_COMPLETED = "STATE_COMPLETED";




// ActionNode model and implementation - BEGIN

function ActionNode(name, action) {
	
	this.name = name;
	this.action = action;


	this.execute = function (plotState) {
		
		var state = plotState.findStateForNode(this);

		console.debug(this.name,state)

		if (state == null)
			plotState.setState(PlotState.STATE_TO_BE_STARTED, this);
/*
		else
			plotState.setState(PlotState.STATE_EXECUTING, this);
*/

		if (state == PlotState.STATE_COMPUTE_RESULT)
			plotState.setState(PlotState.STATE_COMPLETED, this);

	};

	this.children = function () {
		return null;
	};

}

function CompletedNode() {
	
	this.execute = function (plotState) {

		plotState.setState(PlotState.STATE_COMPLETED, this);
		plotState.finished = true;
	};

	this.children = function () {
		return null;
	};

}
// Action model and implementation - END

// IfNode model and implementation - BEGIN
/**
 * This models the "selector" behaviour on two alternative conditions
 * You use this function in configuring your actor behaviour.
 */
function IfNode(name, conditionFunction, actionIfTrue, actionIfFalse) {

	this.name = name;
	this.action = conditionFunction;
	this.actionIfTrue = actionIfTrue;
	this.actionIfFalse = actionIfFalse;

	/**
	 * This makes a given SelectorNode instance execute.
	 * This function is used by the engine executeBehaviourTree
	 * when a node of type SelectorNode is met
	 */
	this.execute = function (plotState) {

		var state = plotState.findStateForNode(this);

		if (state == null)
			plotState.setState(PlotState.STATE_TO_BE_STARTED, this);

		if (state == PlotState.STATE_COMPUTE_RESULT){
			plotState.setState(PlotState.STATE_WAITING, this);

			if (plotState.nodeResult) {
				plotState.setState(PlotState.STATE_TO_BE_STARTED, this.actionIfTrue);
				plotState.setState(PlotState.STATE_DISCARDED, this.actionIfFalse);
			} else {
				plotState.setState(PlotState.STATE_TO_BE_STARTED, this.actionIfFalse);
				plotState.setState(PlotState.STATE_DISCARDED, this.actionIfTrue);
			}

		}
	};

		this.children = function () {
			return [this.actionIfTrue, this.actionIfFalse];
		};

}
// selector model and implementation - END


// SelectorArray model and implementation - BEGIN
/**
 * This is a cool extension of selector that takes a condition function returning the index of the action to be executed.
 * This allows to compact a set of nested conditions in a more readable one.
 */
function IfArrayNode(name, conditionFunction, actionArray) {

	this.name = name;
	this.action = conditionFunction;
	this.actionArray = actionArray;

	this.execute = function (plotState) {

		var state = plotState.findStateForNode(this);

		if (state == null)
			plotState.setState(PlotState.STATE_TO_BE_STARTED, this);

		console.debug("plotState.nodeResult",state, plotState.nodeResult)


		if (state == PlotState.STATE_COMPUTE_RESULT) {
			plotState.setState(PlotState.STATE_WAITING, this);

			for (var j = 0; j < this.actionArray.length; j++) {
				if (j == plotState.nodeResult)
					plotState.setState(PlotState.STATE_TO_BE_STARTED, this.actionArray[j]);
				else
					plotState.setState(PlotState.STATE_DISCARDED, this.actionArray[j]);
			}
		}

	};

	this.children = function () {
		return actionArray;
	};

	this.isConditional = function () {
		return true;
	};

}
// SelectorArray model and implementation - END


// Sequencer model and implementation - BEGIN
/**
 * This is a selector that executes all actions in sequence.
 */
function SequencerNode(name, actionArray) {

	this.name = name;
	this.actionArray = actionArray;

	this.execute = function (plotState) {

		var state = plotState.findStateForNode(this);

		plotState.setState(PlotState.STATE_WAITING);

		plotState.setState(PlotState.STATE_TO_BE_STARTED, actionArray[0]);
	};

	this.children = function () {
		return actionArray;
	};

	this.isConditional = function () {
		return false;
	};

};
// Sequencer model and implementation - END


// SelectorRandom model and implementation - BEGIN
/**
 * This is a cool extension of selector that executes randomly one of the actions in the array.
 */
function SelectorRandomNode(actionArray) {

	this.actionArray = actionArray;

	this.execute = function (plotState) {

		var state = plotState.findStateForNode(this);

		if (state == PlotState.STATE_EXECUTING)
			return;


		var randomIndex = Math.floor(Math.random() * actionArray.length);

		plotState.setState(PlotState.STATE_WAITING, this);

		for (var j = 0; j < actionArray.length; j++) {
			if (j == randomIndex)
				plotState.setState(PlotState.STATE_TO_BE_STARTED, actionArray[j]);
			else
				plotState.setState(PlotState.STATE_DISCARDED, actionArray[j]);
		}
	};

	this.children = function () {
		return actionArray;
	};

	this.isConditional = function () {
		return false;
	};

};
// SelectorRandom model and implementation - END

// SelectorWeightedRandomNode model and implementation - BEGIN
/**
 * Example:
 * [
 * [0.7 Lazy around]
 * [0.2 Pretend to work]
 * [0.1 Actually work]
 * ]
 */
function SelectorWeightedRandomNode(weightsActionMap) {

	this.weightsActionMap = weightsActionMap;

	this.execute = function (plotState) {

		var state = plotState.findStateForNode(this);

		if (state == PlotState.STATE_EXECUTING)
			return;

		var action = chooseByRandom(this.weightsActionMap);
		//console.debug("randomIndex", this.weightsActionMap, action);

		plotState.setState(PlotState.STATE_WAITING, this);

		for (var j = 0; j < this.weightsActionMap.length; j++) {
			if (this.weightsActionMap[j][1] == action)
				plotState.setState(PlotState.STATE_TO_BE_STARTED, action);
			else
				plotState.setState(PlotState.STATE_DISCARDED, this.weightsActionMap[j][1]);
		}
	};

	this.children = function () {
		var actionArray=[];
		for (var j = 0; j < this.weightsActionMap.length; j++) {
			actionArray.push(this.weightsActionMap[j][1]);
		}
		return actionArray;
	};

	this.isConditional = function () {
		return false;
	};

};
// SelectorWeightedRandomNode model and implementation - END

// SelectorRandomProbability model and implementation - BEGIN
/**
 * This node executes randomly one of the nodes on the base of the probability assigned to the node,
 * but to make it easier to write and modify the probability is assigned as an integer value.
 * The node will normalize the values in a [0,1] interval.
 * Example:
 * [
 * [100 Lazy around]
 * [22 Pretend to work]
 * [1 Actually work]
 * ]
 *
 */
function SelectorRandomProbabilityNode(probabilityActionMap) {

	this.weightsActionMap = probabilityActionMap;

	this.execute = function (plotState) {

		var state = plotState.findStateForNode(this);

		if (state == PlotState.STATE_EXECUTING)
			return;


		var action = chooseByProbability(this.weightsActionMap);

		plotState.setState(PlotState.STATE_WAITING, this);

		for (var j = 0; j < this.weightsActionMap.length; j++) {
			if (this.weightsActionMap[j][1] == action)
				plotState.setState(PlotState.STATE_TO_BE_STARTED, action);
			else
				plotState.setState(PlotState.STATE_DISCARDED, this.weightsActionMap[j][1]);
		}
	};

	this.children = function () {
		var actionArray=[];
		for (var j = 0; j < this.weightsActionMap.length; j++) {
			actionArray.push(this.weightsActionMap[j][1]);
		}
		return actionArray;
	};

	this.isConditional = function () {
		return false;
	};

};
// SelectorRandomProbability model and implementation - END

// SequencerRandom model and implementation - BEGIN
/**
 * This is a cool extension of selector that executes all actions in random sequence.
 */
function SequencerRandomNode(actionArray) {

	this.actionArray = actionArray;

	this.execute = function (plotState) {
		shuffle(actionArray);

		plotState.setState(PlotState.STATE_WAITING);

		plotState.setState(PlotState.STATE_TO_BE_STARTED, actionArray[0]);

	};

	this.children = function () {
		return actionArray;
	};

	this.isConditional = function () {
		return false;
	};

};
// SequencerRandom model and implementation - END


/**
 * Utility array shuffle function
 * From http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 */
function shuffle(array) {
	var currentIndex = array.length;
	var temporaryValue;
	var randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function chooseByRandom(weightsActionMap) {
	var rnd = Math.random();
	for(var item in weightsActionMap) {

		var actionMap = weightsActionMap[item];
		if (rnd < actionMap[0])
			return actionMap[1];
		rnd -= actionMap[0];
	}
	throw new Error("The proportions in the collection do not add up to 1.");
}

function chooseByProbability(pointActionMap) {

	var weightsActionMap = [];

	var totalPoints = 0;
	for (var point in pointActionMap){
		totalPoints += pointActionMap[point][0];
	}

	var unit = 1/totalPoints;

	for (var point in pointActionMap){
		weightsActionMap.push([pointActionMap[point][0] * unit, pointActionMap[point][1]]);
	}

	return chooseByRandom(weightsActionMap);
}
