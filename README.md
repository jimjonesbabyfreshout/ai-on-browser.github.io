# AI on Browser

[![npm version](https://badge.fury.io/js/@ai-on-browser%2Fdata-analysis-models.svg)](https://badge.fury.io/js/@ai-on-browser%2Fdata-analysis-models)
[![Coverage Status](https://coveralls.io/repos/github/ai-on-browser/ai-on-browser.github.io/badge.svg?branch=main)](https://coveralls.io/github/ai-on-browser/ai-on-browser.github.io?branch=main)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/ea85dab39fff442685faeaff53afa1a0)](https://www.codacy.com/gh/ai-on-browser/ai-on-browser.github.io/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ai-on-browser/ai-on-browser.github.io&amp;utm_campaign=Badge_Grade)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Machine learning and data analysis package implemented in JavaScript and its online demo.

## Features

- Most of the models are completed in a single file and implemented in a simple way.
- The machine learning part of the code does not use any external libraries.
- All processing in the demo is done in client-side JavaScript.

## Links

- [Online demo](https://ai-on-browser.github.io/)
- [Package document](https://ai-on-browser.github.io/docs)
- [Package release notes](https://github.com/ai-on-browser/ai-on-browser.github.io/releases)

## Caution

- The code is not practical in terms of speed, memory usage, etc.
- There is no single compact file, and each model file exists only separately.
  However, it is possible to use them from the default import as shown in Example.

## Install

### npm

```sh
npm install --save @ai-on-browser/data-analysis-models
```

### HTML

Download from the CDN.

```HTML
<script type="module">
    import dam from 'https://cdn.jsdelivr.net/npm/@ai-on-browser/data-analysis-models@0.8.0/lib/index.min.js';
    // Do something
</script>
```

## Examples

### Ridge

```JavaScript
import dam from '@ai-on-browser/data-analysis-models';

const x = dam.Matrix.randn(100, 3);
const y = x.sum(1);

const model = new dam.models.Ridge(0.1);
model.fit(x.toArray(), y.toArray());

const predict = model.predict(x.toArray());
const error = dam.evaluate.rmse(predict, y.toArray());
console.log(error);
```

### NeuralNetwork

```JavaScript
import dam from '@ai-on-browser/data-analysis-models';

const x = dam.Matrix.randn(100, 3);
const y = x.sum(1);

const layers = [
    { type: 'input' },
    { type: 'full', out_size: 5 },
    { type: 'tanh' },
    { type: 'full', out_size: 1 },
];
const model = dam.models.NeuralNetwork.fromObject(layers, 'mse', 'adam');
for (let i = 0; i < 100; i++) {
    model.fit(x.toArray(), y.toArray());
}

const predict = model.predict(x.toArray());
const error = dam.evaluate.rmse(predict, y.toArray());
console.log(error);
```

### Q-learning

```JavaScript
import dam from '@ai-on-browser/data-analysis-models';

const env = new dam.rl.CartPoleRLEnvironment();
const agent = new dam.models.QAgent(env, 6);

const n = 1.0e+4;
const totalRewards = []
for (let i = 0; i < n; i++) {
    let curState = env.reset();
    totalRewards[i] = 0;
    while (true) {
        const action = agent.get_action(curState, Math.max(0.01, 1 - i / 2000));
        const { state, reward, done } = env.step(action);
        agent.update(action, curState, state, reward);
        totalRewards[i] += reward;
        curState = state;
        if (done) {
            break;
        }
    }

    if (totalRewards.length >= 10 && totalRewards.slice(-10).reduce((s, v) => s + v, 0) / 10 > 150) {
        console.log(i, totalRewards[totalRewards.length - 1]);
        break;
    }
}
```

## Models (with demo)

| task | model |
| ---- | ----- |
| clustering | k-means, k-means++, k-medois, k-medians, x-means, G-means, Weighted k-means, LBG, ISODATA, Soft k-means, Fuzzy c-means, Possibilistic c-means, Kernel k-means, Genetic k-means, Agglomerative (complete linkage, single linkage, group average, Ward's, centroid, weighted average, median), DIANA, Monothetic, Mutual kNN, Mean shift, DBSCAN, OPTICS, HDBSCAN, DENCLUE, PAM, CLARA, CLARANS, BIRCH, CURE, ROCK, C2P, PLSA, Latent dirichlet allocation, GMM, VBGMM, Affinity propagation, Spectral clustering, Mountain, SOM, GTM, (Growing) Neural gas, Growing cell structures, LVQ, ART, SVC, CAST, NMF, Autoencoder |
| classification | Linear discriminant (FLD, LDA), Quadratic discriminant, Mixture discriminant, Least squares, Ridge, (Complement / Negation / Universal-set / Selective) Naive Bayes (gaussian), AODE, k-nearest neighbor, Radius neighbor, Fuzzy k-nearest neighbor, Nearest centroid, DANN, Decision tree, Random forest, Extra trees, GBDT, XGBoost, ALMA, ROMMA, Online gradient descent, Passive aggressive, RLS, Second order perceptron, AROW, NAROW, Confidence weighted, CELLIP, IELLIP, Normal herd, (Multinomial) Logistic regression, (Multinomial) Probit, SVM, Gaussian process, HMM, CRF, Bayesian Network, LVQ, Perceptron, ADALINE, MLP, LMNN |
| semi-supervised classification | k-nearest neighbor, Radius neighbor, Label propagation, Label spreading, k-means, GMM, S3VM, Ladder network |
| regression | Least squares, Ridge, Lasso, Elastic net, RLS, Bayesian linear, Poisson, Least absolute deviations, Huber, Tukey, Least trimmed squares, Least median squares, Lp norm linear, SMA, Deming, Segmented, LOWESS, spline, Gaussian process, Principal components, Partial least squares, Projection pursuit, Quantile regression, k-nearest neighbor, Radius neighbor, IDW, Nadaraya Watson, Priestley Chao, Gasser Muller, RBF Network, RVM, Decision tree, Random forest, Extra trees, GBDT, XGBoost, SVR, MLP, GMR, Isotonic, Ramer Douglas Peucker, Theil-Sen, Passing-Bablok, Repeated median |
| interpolation | Nearest neighbor, IDW, Linear, Spherical linear, Brahmagupta, Logarithmic, Cosine, (Inverse) Smoothstep, Cubic, (Centripetal) Catmull-Rom, Hermit, Polynomial, Lagrange, Trigonometric, Spline, RBF Network, Akima, Natural neighbor, Delaunay |
| anomaly detection | Percentile, MAD, Tukey's fences, Grubbs's test, Thompson test, Tietjen Moore test, Generalized ESD, Hotelling, MT, MCD, k-nearest neighbor, LOF, COF, ODIN, LDOF, INFLO, LOCI, LoOP, LDF, PCA, OCSVM, KDE, GMM, Isolation forest, Autoencoder, GAN |
| dimensionality reduction | Random projection, (Dual/Kernel) PCA, Incremental PCA, Probabilistic PCA, GPLVM, LSA, MDS, Linear discriminant analysis, NCA, ICA, Principal curve, Sammon, FastMap, Sliced inverse regression, LLE, HLLE, Laplacian eigenmaps, Isomap, Diffusion map, SNE, t-SNE, UMAP, SOM, GTM, NMF, MOD, K-SVD, Autoencoder, VAE |
| feature selection | Mutual information, Ridge, Lasso, Elastic net, Decision tree, NCA |
| transformation | Box-Cox, Yeo-Johnson |
| density estimation | Histogram, Average shifted histogram, Polynomial histogram, Maximum likelihood, Kernel density estimation, k-nearest neighbor, Naive Bayes, GMM, HMM |
| generate | MH, Slice sampling, GMM, GBRBM, HMM, VAE, GAN, NICE |
| smoothing | Moving average (simple, linear weighted, triangular), Exponential average, Moving median, Cumulative moving average, KZ filter, Savitzky Golay filter, Hampel filter, Kalman filter, Particle filter, Lowpass filter, Bessel filter, Butterworth filter, Chebyshev filter, Elliptic filter |
| timeseries prediction | Holt winters, AR, ARMA, SDAR, VAR, Kalman filter, MLP, RNN |
| change point detection | Cumulative sum, k-nearest neighbor, LOF, COF, SST, KLIEP, LSIF, uLSIF, LSDD, HMM, Markov switching |
| segmentation | P-Tile, Automatic thresholding, Balanced histogram thresholding, Otsu's method, Sezan, Adaptive thresholding, Bernsen, Niblack, Sauvola, Phansalkar, Split and merge, Statistical Region Merging, Mean shift |
| denoising | Hopfield network, RBM, GBRBM |
| edge detection | Roberts cross, Sobel, Prewitt, Laplacian, LoG, Canny, Snakes |
| word embedding | Word2Vec |
| recommendation | association analysis |
| markov decision process | Dynamic programming, Monte carlo, Q learning, SARSA, Policy gradient, DQN, DDQN, A2C, Genetic algorithm |
| game | |

## Models (only in package)

| type | model |
| ---- | ----- |
| clustering | k-modes, k-prototypes |
| classification | Categorical Naive Bayes |
| semi-supervised classification | Self-training, Co-training |
| regression | Weighted least squares |
| interpolation | Cubic convolution, Sinc, Lanczos, Bilinear, n-linear, n-cubic |
| scaling | Max absolute scaler, Minmax normalization, Robust scaler, Standardization |
| density estimation | ZIP |
| density ratio estimation | RuLSIF |
| | RANSAC |

## Datas

| name | description |
| ---- | ----------- |
| manual | Create 2D or 1D data manually. |
| text | Create text data manually. |
| function | Create from a expression like `exp(-(x ^ 2 + y ^ 2) / 2)`. |
| camera | Images taken with a web camera |
| capture | Images captured from a window |
| microphone | Audio recorded with a microphone |
| upload | Uploaded Text/CSV/Image file |
| Air passenger | Famous 1D time series data |
| Titanic | Titanic data |
| UCI | Data from UCI Machine Learning Repository |
| ESL | Data from The Elements of Statistical Learning |
| e-Stat | Data from Statistics Dashboard (https://dashboard.e-stat.go.jp/en/) |

## Reinforcement learning environment

| name | description |
| ---- | ----------- |
| grid | A simple maze on 2D grid world. |
| cartpole | Stand the pole on the cart. |
| mountain car | Drive the car up the hill. |
| acrobot | Lift the double pendulum. |
| pendulum | Lift the pendulum. |
| maze | A maze on a fine grid plane. |
| waterball | Moving amidst the drift of bait and poison. |
| draughts | Draughts game. |
| reversi | Reversi game. |
| gomoku | Gomoku game. |
| breaker | Breaker game. |

## NeuralNetwork layers

| type | name |
| ---- | ---- |
| basic | input, output, supervisor, include, const, random, variable, activation |
| function | absolute, acos, acosh, asin, asinh, atan, atanh, batch normalization, convolution, cos, cosh, ELU, exp, full, gaussian, Leaky ReLU, linear, log, negative, power, PReLU, ReLU, RReLU, sigmoid, sin, sinh, softmax, softplus, softsign, sqrt, square, tan, tanh |
| operator | add, sub, mult, div, matmul |
| recurrent | GRU, LSTM, Simple RNN |
| reduce | sum, mean, variance, argmax, softargmax |
| loss | Huber, MSE |
| other | concat, split, detach, clip, dropout, One-hot, reshape, flatten, transpose, reverse, sparce, conditional, less |

## Contact

Twitter : [@mirasunimoni](https://twitter.com/mirasunimoni)
