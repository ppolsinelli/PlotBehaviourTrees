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
    function tick(plotManagerInstance, actor) {
        var tick = setInterval(function () {

            var plotState = plotManagerInstance.tellMe();

            if ("who is in sight" == plotState.node.action) {


                plotManagerInstance.setState

            }

            if (behaviourTreeInstance.finished) {
                writeOnConsole(behaviourTreeInstance.actor.name + " has finished.");
                clearTimeout(tick);
            }
        }, 100);
    }

    var ptPoliceman = new IfArrayNode(
        "who is in sight",
        [
            //case kid
            new IfAsyncNode("try reach kid",  new IfNode("reasonableAnswer",PlotManager.COMPLETED, new ActionAsyncNode("bring to station")),PlotManager.COMPLETED),
            // case buddy
            new ActionAsyncNode("go drink with buddy"),
            //no one
            PlotManager.COMPLETED
        ]
    );

    var ptSocialWorker = new IfArrayNode(
        "who is in sight",
        [
            //case kid
            new IfAsyncNode("try reach kid",  new IfNode("reasonableAnswer",PlotManager.COMPLETED, new ActionAsyncNode("bring home")),PlotManager.COMPLETED),
            // case buddy
            new ActionAsyncNode("go smoke with buddy"),
            //no one
            PlotManager.COMPLETED
        ]
    );

    var policeman1 = {};
    policeman1.name = "Bobby";
    policeman1.haveBeenChasing = 0;

    var plotManagerPoliceInstance = new PlotManager(ptPoliceman,5);
    tick(plotManagerPoliceInstance,policeman1);


}



