+++
title = 'Defending Randomness'
date = 2023-09-08T16:56:48+03:00
+++
Determinism is usually good. Knowing what will happen in the future, with certainty, is like a superpower, foiled by its one true nemesis, randomness. In this essay I'd like to shortly defend randomness and value you can gain from random decision making, and ways in which familiar deterministic decision could fail.

Take rounding as an example. Rounding a number up or down is usually seen as a deterministic process. 1.4 rounds down to 1, 1.5 rounds up to 2. To illustrate this, let's play a very particular game. You want to tally up numbers to get the arithmetic mean of all values. However, this tallying is restricted. You're only allowed to decide if you store the number rounded up, or down(I like thousands so we round to thousands here), and you cannot keep track of the past numbers. I start giving you numbers around 1200, and you must round them to whichever thousand you feel like. At the end, we then get the arithmetic mean of all the numbers you stored, and check it against arithmetic mean of actual numbers given to you. You want to round the numbers so the average of your rounded numbers aligns with actual average.

|Case|Number|Rounded|
|---|---|---|
|1|1132|1000|
|2|1220|1000|
|3|1222|1000|
|...|...|...|

Sampling numbers from normal distribution, centered around 1300 and standard deviation of 100, tallying up 1000 such random numbers is likely to give you average of 1000, when summing up the rounded numbers. Intuitively it's rather easy to understand why, 1300, 1400, 1200, and anything up to 1500 would be rounded to 1000. This underestimation is a form of *bias*, some systematic way we know we are steering away from the truth. We could sidestep the problem by using exact numbers, and while that is a valuable lesson, there is a solution to this problem. We can use *stochastic rounding*.

Stochastic rounding is a way to round numbers, where we give up determinism to avoid bias. Instead of 1200 rounding to 1000 or 2000 predictably, we have 20% chance of rounding 1200 to 2000, and 80% chance of rounding 1200 down to 1000. 

{{< iframe src="/stochastic/index.html" width="440" height="150" >}}

Here you can set the normal distribution along desired point, with desired standard deviation(default of 1300, 100). You might want to play around with the numbers a bit, especially to see what happens if mean moves close to, and above, 1500.

Stochastic rounding manages to do something perhaps surprising. The results are more unpredictable, but also, centered around the true value. The more data points you have, the closer the stochastic rounded values get you to the real mean. Which could even be surprising, you might round 1.01 to 2, giving a huge individual error, much bigger than what's possible with regular rounding. But because randomness is fair, you expect these cases to balance out, and leave you with fairly good estimate of the true mean. All this while observing the limitation that we can only store multiples of 1000.

This is related to something done with neural networks dealing with discrete choices. Discrete choices refer to choices with very well defined individual outcomes, like, round up, or round down. With rounding, we were interested in randomness because we wanted our resulting list of rounded numbers, to have the same property, arithmetic mean, as the list of actual numbers. With machine learning however, the reason for randomness comes from other direction. If you are 51% sure some decision is the best, or if you are 99% sure some decision is the best, greedy algorithm would take that same action.

Why is this bad, then? This greedy decision-making could fall victim to making the same suboptimal decision time and time again, because it assumes it's the best, while never actually challenging that assumption, to see the rest of the possibility space. Say, you want to go to work. Each morning, you turn right, climb a mountain and parachute jump to the parking lot, while mythical beasts shoot blazing arrows at you. You might suspect this is not optimal, but every morning you do it, and every morning you get there. Greedy algorithm could easily settle with this status quo, never opting to take the left turn, if you happen to assume the alternative is worse. Greedy algorithm never checks this assumption.

A way to combat this greedy thinking is to try randomness. Instead of choosing the singular best decision, some solutions instead assign probability to each decision that they would be the best. And after getting these probabilities, a decision is made by randomly selecting from all options, weighted by this probability estimate.If result from a random action was good, you conclude you should've had higher probability for that decision, and if the result is bad, you go the other way, decreasing the probability.

We often prefer predictable world around us. There is safety in knowing the hardships you will encounter ahead of time. But, at the cost of giving up some of that predictability, there are ways to gain surprising benefits, like much better exploration and learning, and removing bias.