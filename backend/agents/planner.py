# planner.py
import datetime
import math

class PlannerAgent:
    def __init__(self, start_date=None):
        self.start_date = start_date or datetime.date.today()

    def plan_topics(self, topics, days_between=2):
        plan = []
        for i, topic in enumerate(topics):
            delta = datetime.timedelta(days=(i+1)*days_between)
            plan.append({
                "topic": topic,
                "revise_on": str(self.start_date + delta),
                "status": "pending"
            })
        return plan

    def weighted_plan(self, topic_scores: dict):
        # topic_scores: {topic: weight} heavier weight -> sooner
        topics = sorted(topic_scores.items(), key=lambda x: -x[1])
        plan = []
        for i, (topic, score) in enumerate(topics):
            revise_on = self.start_date + datetime.timedelta(days=(i+1))
            plan.append({"topic": topic, "score": score, "revise_on": str(revise_on)})
        return plan
