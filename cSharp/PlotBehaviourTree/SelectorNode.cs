using System;
using System.Collections.Generic;

namespace PlotBehaviourTree
{
  public class SelectorNode : PlotNode
  {
    private Func<PlotManager, ExecutionResult> conditionFunction;
    private PlotNode actionIfTrue;
    private PlotNode actionIfFalse;

    public SelectorNode(Func<PlotManager, ExecutionResult> conditionFunction,
      PlotNode actionIfTrue, PlotNode actionIfFalse)
    {
      this.conditionFunction = conditionFunction;
      this.actionIfTrue = actionIfTrue;
      this.actionIfFalse = actionIfFalse;
    }

    public ExecutionResult Execute(PlotManager plotManager)
    {
      var state = plotManager.NodeAndState[this];

      if (state == PlotManager.NodeState.STATE_EXECUTING)
        return new ExecutionResult(true);

      ExecutionResult result = conditionFunction(plotManager);

      if (state == PlotManager.NodeState.STATE_EXECUTING)
        return new ExecutionResult(true);

      if (result.BooleanResult)
      {
        plotManager.NodeAndState[actionIfTrue] = PlotManager.NodeState.STATE_TO_BE_STARTED;
        plotManager.NodeAndState[actionIfFalse] = PlotManager.NodeState.STATE_DISCARDED;
      }
      else
      {
        plotManager.NodeAndState[actionIfTrue] = PlotManager.NodeState.STATE_DISCARDED;
        plotManager.NodeAndState[actionIfFalse] = PlotManager.NodeState.STATE_TO_BE_STARTED;
      }

      return result;
    }

    public bool IsConditional()
    {
      return true;
    }

    public List<PlotNode> Children()
    {
      return new List<PlotNode> {actionIfTrue, actionIfFalse};
    }
  }
}
