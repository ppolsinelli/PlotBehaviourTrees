using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;

namespace PlotBehaviourTree
{
  public class ActionNode : PlotNode
  {
    private readonly string action;

    public ActionNode(string name)
      : base(name)
    {
    }


    public override bool IsConditional()
    {
      return false;
    }

    public override List<PlotNode> Children()
    {
      return null;
    }


  }
}

