using System;
using System.Collections.Generic;
using System.Linq;

namespace PlotBehaviourTree
{
  public class SequencerNode : PlotNode
  {
    private PlotNode[] actionArray;

    public SequencerNode(PlotNode[] actionArray)
    {
      this.actionArray = actionArray;
    }

    public ExecutionResult Execute(PlotManager plotManager)
    {
      plotManager.NodeAndState[this] = PlotManager.NodeState.STATE_WAITING;
      plotManager.NodeAndState[actionArray[0]] = PlotManager.NodeState.STATE_TO_BE_STARTED;
      return new ExecutionResult(true);
    }

    public bool IsConditional()
    {
      return true;
    }

    public List<PlotNode> Children()
    {
      return actionArray.ToList();
    }
  }
}