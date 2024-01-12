# Company Risk Similiarity Visualization
This is a next.js project visualizing the companies with the most similiar risks. Demo it here https://company-graph.vercel.app/. 

To run this project locally run "npm i" and then "npm run dev" assuming node is present

The risk similarities were found by running a doc2vec model over the risk factor sections of the companies 10k annual reports see /doc2vecModel/10kDocumentSimiliarity.ipynb.
This involved first getting a list of the S&P500 tickers from wikipedia, then mapping tickers to CIK(the identifier used by the SEC), then finding the url of the most recent 10k for each and finally parsing the "risk factors" section from the documents at these urls. Once all the text is present the model is trained and similiar risk companies can be found with something like:

```python
model.dv.most_similar(topn=3,positive=['luv'])
```

Which finds the three companies most similiar to Southwest Airlines(LUV).

It can be run locally with "jupyter-lab" if python is configured and jupyter installed.

## Purpose
This project was a test of functionality that could eventually be folded into https://insiderviz.com. Ultimately I found that the risk similarities between companies in its current state doesn't produce a novel result and the force sim used for visualization has performance and accessibility issues.

Something interesting I didn't know was the risks of logistics companies like Fedex and UPS were so similiar to passenger airlines like Delta or Southwest. This is totally reasonable and can be explained by them both being in transportation.

## Lessons
How to safely manually change the DOM while the react reconciler was reconciling the virtual DOM and DOM. Essentially create a div which is a leaf in the virtual DOM and then use ref variables instead of state to avoid unexpected updates. When using useEffect for onMount behavior make sure to create manual locks that ensure your addition only runs once which can either be ref variables or be checks on the number of children tags have. When state changes the reconciler will consider what needs to be changed so if your manual addition is in some way a child in the DOM of something changed by react state you will need a useEffect dependent on that state where you can prevent the reconciler from breaking your addition.

