using System;
using System.Collections.Generic;
using System.Linq;

namespace PlotBehaviourTree
{
  public class SelectorProbabilityRandomArrayNode : PlotNode
  {

    private Dictionary<PlotNode, int> actionArrayAndLikelihood;

    public SelectorProbabilityRandomArrayNode(Dictionary<PlotNode, int> actionArrayAndLikelihood)
    {
      this.actionArrayAndLikelihood = actionArrayAndLikelihood;
    }

    public ExecutionResult Execute(PlotManager plotManager)
    {
      var state = plotManager.NodeAndState[this];

      if (state == PlotManager.NodeState.STATE_EXECUTING)
        return new ExecutionResult(true);

      if (state == PlotManager.NodeState.STATE_COMPUTE_RESULT)
      {
        PlotNode picked = ChooseByProbability(actionArrayAndLikelihood);

        plotManager.NodeAndState[this] = PlotManager.NodeState.STATE_WAITING;
        plotManager.NodeAndState[picked] = PlotManager.NodeState.STATE_TO_BE_STARTED;

        foreach (var item in actionArrayAndLikelihood)
        {
          if (item.Key != picked)
            plotManager.NodeAndState[item.Key] = PlotManager.NodeState.STATE_DISCARDED;
        }
      }
      return new ExecutionResult(true);
    }

    public static PlotNode ChooseByProbability(
      Dictionary<PlotNode, int> actionArrayAndLikelihood)
    {
      Dictionary<PlotNode, float> collection = new Dictionary<PlotNode, float>();

      var totalPoints = 0;
      foreach (int point in actionArrayAndLikelihood.Values)
      {
        totalPoints += point;
      }

      var unit = 1/totalPoints;

      foreach (var item in actionArrayAndLikelihood)
      {
        collection.Add(item.Key, item.Value*unit);
      }

      return SelectorWeightedRandomArrayNode.ChooseByRandom(collection);
    }


    public bool IsConditional()
    {
      return true;
    }

    public List<PlotNode> Children()
    {
      return actionArrayAndLikelihood.Keys.ToList();
    }

  }
}