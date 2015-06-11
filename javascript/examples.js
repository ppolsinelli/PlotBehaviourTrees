/**
 * Created by Pietro Polsinelli && Matteo Bicocchi on 15/05/2015.
 *
 * Fisrt inspired by the simplicity of
 * http://stackoverflow.com/questions/4241824/creating-an-ai-behavior-tree-in-c-sharp-how
 *
 * Follow us on Twitter @ppolsinelli @pupunzi where we post about game design, game development, Unity3d 2D, HTML5, CSS3, jquery, applied games.
 *
 */


/**
 * Utility functions
 */

function writeOnConsole(text) {
	var node = document.createElement("LI");                 // Create a <li> node
	var textnode = document.createTextNode(text);         // Create a text node
	node.appendChild(textnode);                              // Append the text to <li>
	document.getElementById("console").appendChild(node);     // Append <li> to <ul> with id="myList"
//	console.debug(text)
}

var totalKidsWondering = 20;

function example() {

	/**
	 * This is what makes all your behaviour trees instances run. (implement your own tick)
	 */
	function tick(plotStateInstance, actor) {
		var tick = setInterval(function () {

			plotStateInstance.tellMe();

			var currentNode = plotStateInstance.currentNode;
			var currentState = plotStateInstance.findStateForNode(currentNode);

			if(plotStateInstance.hasToStart()){

				plotStateInstance.executing();

				writeOnConsole(currentNode.name, currentNode.action, plotStateInstance.findStateForNode(currentNode));

				setTimeout(function(){
					if(plotStateInstance.currentNode.action == "takeALook")
						plotStateInstance.complete(Math.random() > 10.49 ? 0 : 1);
					else
						plotStateInstance.complete(Math.random() > 10.49 ? true : false);

					writeOnConsole(currentNode.name, currentNode.action, plotStateInstance.findStateForNode(currentNode));

				}, 3000)

			}

/*
			if ("who is in sight" == plotState.node.action) {

				plotStateInstance.setState

			}
*/

			if (plotStateInstance.finished) {
				writeOnConsole(actor.name + " has finished.");
				clearTimeout(tick);
			}
		}, 1000);
	}

/*
	var ptPoliceman = new IfNode(
			"who is in sight",
			"takeALook",
				//case kid
				new IfNode("try reach kid", "runAfterKid", new IfNode("reasonableAnswer", new CompletedNode(), new ActionNode("bring to station")),new CompletedNode()),
				// case buddy
				new SequencerNode("Bobby actions",[ new ActionNode("go drink with buddy", "drinkBuddy"),new ActionNode("go sleep", "goSleep") ] )

);
*/
	var ptPoliceman = new IfArrayNode(
			"who is in sight",
			"takeALook",[
				//case kid
				new IfNode("try reach kid", "runAfterKid", new IfNode("reasonableAnswer", new CompletedNode(), new ActionNode("bring to station")),new CompletedNode()),
				// case buddy
				new SequencerNode("Bobby actions",[ new ActionNode("go drink with buddy", "drinkBuddy"),new ActionNode("go sleep", "goSleep") ] )
			]
);
/*
	var ptPoliceman = new IfNode(
			"who is in sight",
			[
				//case kid
				new IfNode("try reach kid", "runAfterKid", new IfNode("reasonableAnswer", new CompletedNode(), new ActionNode("bring to station")),new CompletedNode()),
				// case buddy
				new ActionNode("go drink with buddy", "drinkBuddy"),
				//no one
				new CompletedNode()
]
);
*/

/*
	var ptSocialWorker = new IfArrayNode(
			"who is in sight",
			[
				//case kid
				new IfAsyncNode("try reach kid",  new IfNode("reasonableAnswer",PlotManager.COMPLETED, new ActionAsyncNode("bring home")),new CompletedNode()),
				// case buddy
				new ActionAsyncNode("go smoke with buddy"),
				//no one
				new CompletedNode()
			]
	);
*/

	var policeman1 = {};
	policeman1.name = "Bobby";
	policeman1.haveBeenChasing = 0;

	console.debug("bbb")

	var plotManagerPoliceInstance = new PlotState(ptPoliceman,1);
	tick(plotManagerPoliceInstance,policeman1);


}



