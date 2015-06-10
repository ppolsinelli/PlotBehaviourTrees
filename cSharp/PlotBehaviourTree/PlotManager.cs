using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using UnityEngine;
using Debug = UnityEngine.Debug;

namespace PlotBehaviourTree
{
  public class PlotManager
  {
    public enum NodeState
    {
      STATE_TO_BE_STARTED,
      STATE_WAITING,
      STATE_DISCARDED,
      STATE_EXECUTING,
      STATE_COMPUTE_RESULT,
      STATE_COMPLETED
    };

    private PlotNode rootNode;
   
    public bool Completed = false;

    public Dictionary<PlotNode, NodeState> NodeAndState =
      new Dictionary<PlotNode, NodeState>();

    private PlotNode currentNode = null;

    public PlotManager(PlotNode rootNode)
    {
      this.rootNode = rootNode;
      this.currentNode = rootNode;
     }

    public bool HasToStart()
    {
      NodeState state = NodeAndState[currentNode];
      return state != NodeState.STATE_EXECUTING && state != NodeState.STATE_COMPUTE_RESULT;
    }

    public bool HasToComplete()
    {
      NodeState state = NodeAndState[currentNode];
      return state == NodeState.STATE_COMPUTE_RESULT;
    }

    public void CompletedAsync()
    {
      if (currentNode.IsConditional())
      {
        Debug.Log("CompletedAsync for conditional node " + currentNode);
        NodeAndState[currentNode] = NodeState.STATE_COMPUTE_RESULT;
      }
      else
      {
        Debug.Log("CompletedAsync for not conditional node " + currentNode);
        NodeAndState[currentNode] = NodeState.STATE_COMPLETED;
      }
    }

    public void WaitUntil(Action callback)
    {
      NodeAndState[currentNode] = NodeState.STATE_EXECUTING;
      if (callback!=null)
        callback();
    }

    public ExecutionResult ExecuteBehaviourTree()
    {
      if (Completed)
      {
        return new ExecutionResult(true);
      }

      //find current node to be executed, or a running one, or root to launch, or root completed
      currentNode = FindCurrentNode(rootNode);

      if (currentNode == null)
      {
        numberOfRuns++;
        if (numberOfLoops == 0 || numberOfRuns < numberOfLoops)
        {
          NodeAndState = new Dictionary<PlotNode, NodeState>();
          currentNode = FindCurrentNode(rootNode);
        }
        else
        {
          Completed = true;
          return new ExecutionResult(true);
        }
      }

      bool toBeStarted = false;
      if (NodeAndState.ContainsKey(currentNode))
      {
        toBeStarted = NodeAndState[currentNode] == PlotManager.NodeState.STATE_TO_BE_STARTED;
      }
      else
      {
        toBeStarted = true;
      }

      if (toBeStarted)
      {
        this.Actor.SetLastActedOn(Time.time);
        ExecutionResult result = currentNode.Execute(this);
        var afterState = NodeAndState[currentNode];

        if (afterState == PlotManager.NodeState.STATE_TO_BE_STARTED)
          NodeAndState[currentNode] = PlotManager.NodeState.STATE_COMPLETED;
        return result;
      }

      NodeState state = NodeAndState[currentNode];

      if (state == PlotManager.NodeState.STATE_COMPUTE_RESULT)
      {
        this.Actor.SetLastActedOn(Time.time);
        ExecutionResult result = currentNode.Execute(this);
        NodeAndState[currentNode] = PlotManager.NodeState.STATE_COMPLETED;
        return result;
      }

      return null;
    }

    public PlotNode FindCurrentNode(PlotNode node)
    {
      if (!NodeAndState.ContainsKey(node))
      {
        NodeAndState[node] = PlotManager.NodeState.STATE_TO_BE_STARTED;
        return node;
      }

      var state = NodeAndState[node];

      if (state == PlotManager.NodeState.STATE_DISCARDED)
        return null;

      if (state == PlotManager.NodeState.STATE_EXECUTING ||
          state == PlotManager.NodeState.STATE_COMPUTE_RESULT ||
          state == PlotManager.NodeState.STATE_TO_BE_STARTED
        )
        return node;

      var children = node.Children();
      if (children == null)
      {
        return null;
      }
      else
      {
        for (var i = 0; i < node.Children().Count; i++)
        {
          var childNode = FindCurrentNode(children[i]);
          if (childNode != null)
            return childNode;
        }
        if (state == PlotManager.NodeState.STATE_WAITING)
        {
          NodeAndState[node] = PlotManager.NodeState.STATE_COMPLETED;
        }
      }
      return null;
    }
  }

}