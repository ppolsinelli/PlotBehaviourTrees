# Plot Behaviour Trees
A simple framework for events and behaviour trees.

This framework is designed to facilitate defining a narrative and behaviour for non player characters, 
in both JavaScript for HTML5 games and in C#, probably for Unity games.

This framework is explained in a detailed video and blog post [coming soon].

There is an example that simply runs in your browser. 
Here is a working browser demo: 
[coming soon]
and here is a full blog post on this code:
[coming soon]

*A note on the C# version*

Any implementation of behaviour trees makes sense in an asynchronous contexts where there is some form of "tick". We used here as engine the Unity environment, which gives us the asynchronous engine that we need for the example. By replacing the MonoBehaviour dependencies you can make it work anywhere.

*How to make it work*

For Javascript, just launch a brower on demo.html. For C#, in Unity create two game objects, on the first "Ticker" add the script UnitySampleTicker, on the second "PoliceManager" add the script PoliceManager, and then on the game object Ticker drag PoliceManager objct as value of Pm property. Run Unity and check the console log.


By Pietro Polsinelli [@ppolsinelli](https://twitter.com/ppolsinelli) and Matteo Bicocchi [@pupunzi](https://twitter.com/pupunzi) on Twitter.

