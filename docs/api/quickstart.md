# Python SDK 快速开始

## 安装

~~~bash
pip install --upgrade thinkcat --index-url https://thinkcatlabs.ai/sdk/
pip install scikit-learn
~~~

## 分类

~~~python
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from thinkcat_client import ThinkcatClassifier

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = ThinkcatClassifier()
model.fit(X_train, y_train)
predictions = model.predict(X_test)
print(predictions[:5])
~~~
