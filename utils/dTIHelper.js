
const rarities = ["d", "c", "b", "a", "s", "ss", "sss"];
const stats = {
    cpu: [
        { hack: [8, 18], trueDam: [0, 0], pen: [0, 0], chance: [0, 0], dam: [0, 0] },
        { hack: [18.5, 33.5], trueDam: [0, 10], pen: [0, 5], chance: [0, 2.5], dam: [1, 5] },
        { hack: [34, 54], trueDam: [0, 20], pen: [0, 15], chance: [2.5, 3.25], dam: [5, 7.5] },
        { hack: [55, 64.25], trueDam: [0, 30], pen: [0, 20], chance: [4, 6.25], dam: [8.25, 15] },
        { hack: [68.75, 84.75], trueDam: [0, 40], pen: [13, 25], chance: [6.5, 7.5], dam: [17, 25] },
        { hack: [91, 105], trueDam: [43, 50], pen: [19.5, 30], chance: [8.25, 10], dam: [19.5, 30] },
        { hack: [125.5,135.5], trueDam: [55,60], pen: [32.5,35], chance: [11.25,12.5], dam: [32.5,35] }
    ],
    firewall: [
        { hp: [22,62], rd: [0,0], regen: [0,0], medium: [0,0], long: [0,0] },
        { hp: [64,114], rd: [0,7.5], regen: [0,2.5], medium: [0,0], long: [0,0] },
        { hp: [116,166], rd: [0,10], regen: [0,5], medium: [0,30], long: [0,0] },
        { hp: [172,217], rd: [0,12.5], regen: [0,7.5], medium: [22,40], long: [0,25] },
        { hp: [234,269], rd: [0,15], regen: [8,10], medium: [34,0], long: [22,30] },
        { hp: [285,320], rd: [11.5,15], regen: [10.75,12.5], medium: [65,47.5], long: [28,35] },
        { hp: [372,397], rd: [16.25,17.5], regen: [13.75,15], medium: [80,70], long: [37.5,45] }
    ],
    gpu: [
        { idle: [0.000010,0.000014], bart: [0,0], crip: [0,0], },
        { idle: [0.000011,0.000024], bart: [0,10], crip: [2.5,10], },
        { idle: [0.000016,0.000033], bart: [0,12.5], crip: [2.5,12.5], },
        { idle: [0.0000223,0.000043], bart: [0,15], crip: [6,15], },
        { idle: [0.0000348,0.000054], bart: [0,20], crip: [10,20], },
        { idle: [0.0000516,0.000074], bart: [16.25,25], crip: [16.25,25], },
        { idle: [0.000077,0.000094], bart: [22.5,30], crip: [22.5,30], }
    ],
    psu: [
        { boost: [1, 5], },
        { boost: [5, 10], },
        { boost: [10, 15], },
        { boost: [16, 25], },
        { boost: [27, 35], },
        { boost: [36.5, 40], },
        { boost: [50, 55], },
    ],
    port: [
        { hp: 1000+3*60, rd: 0 },
        { hp: 1000+3*114, rd: 3*0.075 },
        { hp: 1000+3*166, rd: 3*0.1 },
        { hp: 1000+3*217, rd: 3*0.125 },
        { hp: 1000+3*269, rd: 3*0.15 },
        { hp: 1000+3*320, rd: 3*0.15 },
        { hp: 1000+3*397, rd: 3*0.175}
    ],
    cputerm: [
        3, 3.5, 4, 4.25, 4.75, 5, 5.5
    ],
    fireterm: [
        12, 14, 16, 17, 19, 20, 22
    ],
    gpu_term: [
        0.0000042*0.6, 0.0000042*0.7, 0.0000042*0.8, 0.0000042*0.85, 0.0000042*0.95, 0.0000042, 0.0000042*1.1
    ],
    psu_term: [
        1.2, 1.4, 1.6, 1.7, 1.9, 2, 2.2
    ],
    cpu_dPM: [
        [1.0, 1.1, 1.2, 1.29, 1.39, 1.49, 1.59, 1.68, 1.78, 1.88, 1.97, 2.07, 2.17, 2.26, 2.36, 2.46, 2.55, 2.65, 2.74, 2.84, 2.93, 3.03, 3.12, 3.22, 3.31, 3.41, 3.5, 3.59, 3.69, 3.78, 3.87, 3.97, 4.06, 4.15, 4.25, 4.34, 4.43, 4.52, 4.61, 4.7, 4.79, 4.89, 4.98, 5.07, 5.16, 5.25, 5.34, 5.43, 5.52, 5.61, 5.7, 5.79, 5.88, 5.97, 6.06, 6.14, 6.23, 6.32, 6.41, 6.5, 6.59, 6.67, 6.76, 6.85, 6.93, 7.02, 7.11, 7.2, 7.29, 7.37, 7.46, 7.55, 7.63, 7.72, 7.8, 7.89, 7.98, 8.07, 8.15, 8.24, 8.32, 8.41, 8.49, 8.58, 8.66, 8.75, 8.83, 8.92, 9.0, 9.08, 9.17, 9.25, 9.34, 9.42, 9.5, 9.59, 9.67, 9.75, 9.83, 9.92, 10.0],
        [1.11, 2.53, 2.86, 3.09, 3.27, 3.42, 3.55, 3.67, 3.78, 3.87, 3.97, 4.05, 4.13, 4.21, 4.29, 4.36, 4.42, 4.49, 4.55, 4.62, 4.68, 4.73, 4.79, 4.84, 4.9, 4.95, 5.0, 5.05, 5.1, 5.15, 5.19, 5.24, 5.28, 5.33, 5.37, 5.42, 5.46, 5.5, 5.55, 5.59, 5.63, 5.67, 5.71, 5.75, 5.79, 5.83, 5.87, 5.91, 5.95, 5.99, 6.03, 6.07, 6.11, 6.15, 6.19, 6.23, 6.27, 6.3, 6.34, 6.38, 6.42, 6.46, 6.5, 6.54, 6.58, 6.62, 6.67, 6.71, 6.75, 6.79, 6.83, 6.88, 6.92, 6.97, 7.01, 7.06, 7.1, 7.15, 7.2, 7.25, 7.3, 7.35, 7.4, 7.45, 7.51, 7.56, 7.62, 7.69, 7.75, 7.81, 7.89, 7.96, 8.04, 8.12, 8.21, 8.32, 8.43, 8.57, 8.74, 8.98, 9.79],
        [1.1, 2.69, 3.08, 3.35, 3.55, 3.73, 3.88, 4.01, 4.13, 4.23, 4.33, 4.43, 4.51, 4.6, 4.67, 4.75, 4.82, 4.88, 4.95, 5.01, 5.07, 5.13, 5.19, 5.24, 5.3, 5.35, 5.4, 5.45, 5.5, 5.54, 5.59, 5.64, 5.68, 5.73, 5.77, 5.81, 5.86, 5.9, 5.94, 5.98, 6.02, 6.06, 6.1, 6.14, 6.18, 6.22, 6.26, 6.3, 6.34, 6.38, 6.42, 6.46, 6.49, 6.53, 6.57, 6.61, 6.65, 6.68, 6.72, 6.76, 6.8, 6.84, 6.87, 6.91, 6.95, 6.99, 7.03, 7.07, 7.11, 7.14, 7.18, 7.22, 7.26, 7.31, 7.35, 7.39, 7.43, 7.48, 7.52, 7.56, 7.61, 7.66, 7.71, 7.75, 7.8, 7.86, 7.91, 7.97, 8.03, 8.09, 8.16, 8.23, 8.3, 8.38, 8.46, 8.56, 8.67, 8.8, 8.95, 9.18, 9.89],
        [1.13, 2.56, 2.91, 3.17, 3.38, 3.56, 3.72, 3.86, 3.99, 4.12, 4.23, 4.34, 4.44, 4.53, 4.62, 4.71, 4.79, 4.88, 4.95, 5.03, 5.1, 5.17, 5.24, 5.3, 5.37, 5.43, 5.49, 5.54, 5.6, 5.66, 5.71, 5.76, 5.82, 5.87, 5.91, 5.96, 6.01, 6.06, 6.1, 6.15, 6.19, 6.24, 6.28, 6.32, 6.36, 6.4, 6.45, 6.49, 6.53, 6.57, 6.61, 6.64, 6.68, 6.72, 6.76, 6.8, 6.84, 6.88, 6.92, 6.96, 7.0, 7.04, 7.08, 7.12, 7.16, 7.2, 7.24, 7.28, 7.32, 7.37, 7.41, 7.45, 7.5, 7.54, 7.59, 7.64, 7.68, 7.73, 7.78, 7.83, 7.88, 7.93, 7.98, 8.03, 8.09, 8.14, 8.2, 8.26, 8.32, 8.38, 8.44, 8.51, 8.58, 8.65, 8.73, 8.82, 8.91, 9.02, 9.15, 9.31, 9.86],
        [1.23, 2.65, 3.01, 3.25, 3.45, 3.61, 3.75, 3.88, 4.0, 4.11, 4.21, 4.31, 4.4, 4.48, 4.56, 4.64, 4.72, 4.79, 4.86, 4.93, 4.99, 5.05, 5.11, 5.17, 5.23, 5.29, 5.35, 5.4, 5.46, 5.51, 5.57, 5.62, 5.67, 5.72, 5.77, 5.82, 5.87, 5.92, 5.96, 6.01, 6.06, 6.11, 6.15, 6.2, 6.25, 6.29, 6.34, 6.38, 6.43, 6.47, 6.52, 6.56, 6.6, 6.65, 6.69, 6.74, 6.78, 6.82, 6.87, 6.91, 6.95, 6.99, 7.03, 7.08, 7.12, 7.16, 7.2, 7.24, 7.28, 7.33, 7.37, 7.41, 7.45, 7.5, 7.54, 7.58, 7.63, 7.67, 7.72, 7.76, 7.81, 7.86, 7.9, 7.95, 8.0, 8.06, 8.11, 8.16, 8.22, 8.28, 8.34, 8.4, 8.47, 8.54, 8.62, 8.7, 8.8, 8.91, 9.04, 9.23, 9.86],
        [1.24, 2.48, 2.76, 2.96, 3.12, 3.25, 3.37, 3.47, 3.57, 3.65, 3.74, 3.82, 3.89, 3.96, 4.03, 4.1, 4.16, 4.22, 4.28, 4.34, 4.4, 4.45, 4.51, 4.56, 4.62, 4.67, 4.72, 4.77, 4.82, 4.87, 4.92, 4.96, 5.01, 5.05, 5.1, 5.15, 5.19, 5.24, 5.29, 5.33, 5.38, 5.42, 5.47, 5.51, 5.56, 5.6, 5.65, 5.69, 5.74, 5.78, 5.83, 5.87, 5.91, 5.96, 6.0, 6.05, 6.09, 6.13, 6.18, 6.22, 6.26, 6.31, 6.35, 6.4, 6.44, 6.49, 6.53, 6.57, 6.62, 6.66, 6.71, 6.76, 6.8, 6.85, 6.89, 6.94, 6.99, 7.04, 7.09, 7.14, 7.19, 7.24, 7.29, 7.35, 7.4, 7.46, 7.52, 7.58, 7.64, 7.71, 7.78, 7.85, 7.93, 8.02, 8.11, 8.2, 8.31, 8.44, 8.6, 8.83, 9.69],
        [1.24, 2.52, 2.8, 3.0, 3.16, 3.29, 3.41, 3.51, 3.6, 3.69, 3.77, 3.84, 3.91, 3.98, 4.05, 4.11, 4.16, 4.22, 4.28, 4.33, 4.38, 4.43, 4.48, 4.53, 4.58, 4.63, 4.67, 4.72, 4.76, 4.81, 4.85, 4.89, 4.93, 4.98, 5.02, 5.06, 5.1, 5.14, 5.18, 5.22, 5.26, 5.3, 5.33, 5.37, 5.41, 5.45, 5.49, 5.52, 5.56, 5.6, 5.64, 5.68, 5.71, 5.75, 5.79, 5.83, 5.86, 5.9, 5.94, 5.98, 6.02, 6.06, 6.1, 6.13, 6.17, 6.21, 6.25, 6.29, 6.33, 6.38, 6.42, 6.46, 6.5, 6.55, 6.59, 6.63, 6.68, 6.73, 6.77, 6.82, 6.87, 6.92, 6.98, 7.03, 7.08, 7.14, 7.2, 7.26, 7.32, 7.39, 7.46, 7.54, 7.62, 7.71, 7.81, 7.91, 8.04, 8.18, 8.36, 8.62, 9.62]
    ],
    // Mythic GPU distribution fixed as of 8/21/2024 
    gpu_dPM: [
        [1.252e-05, 1.256e-05, 1.26e-05, 1.264e-05, 1.268e-05, 1.272e-05, 1.276e-05, 1.28e-05, 1.284e-05, 1.288e-05, 1.292e-05, 1.296e-05, 1.3e-05, 1.304e-05, 1.308e-05, 1.312e-05, 1.316e-05, 1.32e-05, 1.324e-05, 1.328e-05, 1.332e-05, 1.336e-05, 1.34e-05, 1.344e-05, 1.348e-05, 1.352e-05, 1.356e-05, 1.36e-05, 1.364e-05, 1.368e-05, 1.372e-05, 1.376e-05, 1.38e-05, 1.384e-05, 1.388e-05, 1.392e-05, 1.396e-05, 1.4e-05, 1.404e-05, 1.408e-05, 1.412e-05, 1.416e-05, 1.42e-05, 1.424e-05, 1.428e-05, 1.432e-05, 1.436e-05, 1.44e-05, 1.444e-05, 1.448e-05, 1.452e-05, 1.456e-05, 1.46e-05, 1.464e-05, 1.468e-05, 1.472e-05, 1.476e-05, 1.48e-05, 1.484e-05, 1.488e-05, 1.492e-05, 1.496e-05, 1.5e-05, 1.504e-05, 1.508e-05, 1.512e-05, 1.516e-05, 1.52e-05, 1.524e-05, 1.528e-05, 1.532e-05, 1.536e-05, 1.54e-05, 1.544e-05, 1.548e-05, 1.552e-05, 1.556e-05, 1.56e-05, 1.564e-05, 1.568e-05, 1.572e-05, 1.576e-05, 1.58e-05, 1.584e-05, 1.588e-05, 1.592e-05, 1.596e-05, 1.6e-05, 1.604e-05, 1.608e-05, 1.612e-05, 1.616e-05, 1.62e-05, 1.624e-05, 1.628e-05, 1.632e-05, 1.636e-05, 1.64e-05, 1.644e-05, 1.648e-05, 1.652e-05],
        [1.394e-05, 1.407e-05, 1.42e-05, 1.433e-05, 1.446e-05, 1.459e-05, 1.472e-05, 1.485e-05, 1.498e-05, 1.511e-05, 1.524e-05, 1.537e-05, 1.55e-05, 1.563e-05, 1.575e-05, 1.588e-05, 1.602e-05, 1.614e-05, 1.627e-05, 1.641e-05, 1.654e-05, 1.667e-05, 1.68e-05, 1.693e-05, 1.705e-05, 1.718e-05, 1.731e-05, 1.744e-05, 1.757e-05, 1.771e-05, 1.783e-05, 1.797e-05, 1.81e-05, 1.823e-05, 1.836e-05, 1.849e-05, 1.862e-05, 1.875e-05, 1.888e-05, 1.9e-05, 1.913e-05, 1.926e-05, 1.939e-05, 1.952e-05, 1.965e-05, 1.978e-05, 1.991e-05, 2.004e-05, 2.017e-05, 2.03e-05, 2.043e-05, 2.057e-05, 2.07e-05, 2.083e-05, 2.096e-05, 2.109e-05, 2.122e-05, 2.135e-05, 2.147e-05, 2.161e-05, 2.173e-05, 2.186e-05, 2.199e-05, 2.212e-05, 2.225e-05, 2.238e-05, 2.251e-05, 2.264e-05, 2.277e-05, 2.29e-05, 2.303e-05, 2.316e-05, 2.329e-05, 2.342e-05, 2.355e-05, 2.368e-05, 2.381e-05, 2.394e-05, 2.407e-05, 2.42e-05, 2.433e-05, 2.447e-05, 2.46e-05, 2.473e-05, 2.486e-05, 2.499e-05, 2.511e-05, 2.524e-05, 2.537e-05, 2.55e-05, 2.563e-05, 2.576e-05, 2.589e-05, 2.602e-05, 2.615e-05, 2.628e-05, 2.641e-05, 2.654e-05, 2.668e-05, 2.681e-05, 2.694e-05],
        [1.936e-05, 1.953e-05, 1.97e-05, 1.987e-05, 2.004e-05, 2.021e-05, 2.038e-05, 2.054e-05, 2.072e-05, 2.088e-05, 2.105e-05, 2.122e-05, 2.14e-05, 2.157e-05, 2.174e-05, 2.191e-05, 2.208e-05, 2.225e-05, 2.242e-05, 2.26e-05, 2.276e-05, 2.293e-05, 2.311e-05, 2.328e-05, 2.344e-05, 2.362e-05, 2.379e-05, 2.396e-05, 2.413e-05, 2.43e-05, 2.447e-05, 2.464e-05, 2.481e-05, 2.498e-05, 2.514e-05, 2.531e-05, 2.548e-05, 2.566e-05, 2.583e-05, 2.599e-05, 2.617e-05, 2.633e-05, 2.65e-05, 2.667e-05, 2.684e-05, 2.701e-05, 2.718e-05, 2.735e-05, 2.752e-05, 2.768e-05, 2.785e-05, 2.802e-05, 2.819e-05, 2.836e-05, 2.853e-05, 2.87e-05, 2.887e-05, 2.904e-05, 2.921e-05, 2.939e-05, 2.955e-05, 2.972e-05, 2.989e-05, 3.006e-05, 3.023e-05, 3.04e-05, 3.057e-05, 3.074e-05, 3.091e-05, 3.108e-05, 3.125e-05, 3.142e-05, 3.159e-05, 3.176e-05, 3.193e-05, 3.21e-05, 3.227e-05, 3.244e-05, 3.261e-05, 3.278e-05, 3.295e-05, 3.312e-05, 3.329e-05, 3.346e-05, 3.363e-05, 3.38e-05, 3.397e-05, 3.414e-05, 3.431e-05, 3.448e-05, 3.466e-05, 3.483e-05, 3.499e-05, 3.517e-05, 3.534e-05, 3.551e-05, 3.568e-05, 3.585e-05, 3.602e-05, 3.619e-05, 3.636e-05],
        [2.587e-05, 2.608e-05, 2.628e-05, 2.65e-05, 2.67e-05, 2.691e-05, 2.711e-05, 2.732e-05, 2.753e-05, 2.773e-05, 2.794e-05, 2.814e-05, 2.835e-05, 2.856e-05, 2.877e-05, 2.897e-05, 2.918e-05, 2.938e-05, 2.959e-05, 2.979e-05, 3e-05, 3.02e-05, 3.041e-05, 3.062e-05, 3.083e-05, 3.103e-05, 3.124e-05, 3.144e-05, 3.165e-05, 3.185e-05, 3.206e-05, 3.227e-05, 3.248e-05, 3.269e-05, 3.289e-05, 3.31e-05, 3.331e-05, 3.351e-05, 3.372e-05, 3.393e-05, 3.414e-05, 3.435e-05, 3.456e-05, 3.476e-05, 3.497e-05, 3.518e-05, 3.538e-05, 3.559e-05, 3.58e-05, 3.6e-05, 3.621e-05, 3.642e-05, 3.663e-05, 3.683e-05, 3.704e-05, 3.725e-05, 3.745e-05, 3.766e-05, 3.787e-05, 3.807e-05, 3.828e-05, 3.849e-05, 3.869e-05, 3.89e-05, 3.91e-05, 3.931e-05, 3.952e-05, 3.973e-05, 3.993e-05, 4.014e-05, 4.035e-05, 4.055e-05, 4.076e-05, 4.096e-05, 4.117e-05, 4.138e-05, 4.159e-05, 4.18e-05, 4.201e-05, 4.221e-05, 4.242e-05, 4.263e-05, 4.283e-05, 4.304e-05, 4.325e-05, 4.346e-05, 4.366e-05, 4.387e-05, 4.408e-05, 4.428e-05, 4.449e-05, 4.47e-05, 4.491e-05, 4.511e-05, 4.532e-05, 4.553e-05, 4.574e-05, 4.594e-05, 4.615e-05, 4.636e-05, 4.657e-05],
        [4.119e-05, 4.135e-05, 4.153e-05, 4.17e-05, 4.186e-05, 4.203e-05, 4.22e-05, 4.237e-05, 4.254e-05, 4.271e-05, 4.287e-05, 4.304e-05, 4.321e-05, 4.338e-05, 4.355e-05, 4.371e-05, 4.388e-05, 4.405e-05, 4.422e-05, 4.439e-05, 4.455e-05, 4.472e-05, 4.489e-05, 4.506e-05, 4.522e-05, 4.539e-05, 4.556e-05, 4.573e-05, 4.589e-05, 4.606e-05, 4.623e-05, 4.64e-05, 4.656e-05, 4.673e-05, 4.69e-05, 4.707e-05, 4.724e-05, 4.74e-05, 4.757e-05, 4.774e-05, 4.791e-05, 4.807e-05, 4.824e-05, 4.841e-05, 4.858e-05, 4.875e-05, 4.892e-05, 4.909e-05, 4.925e-05, 4.942e-05, 4.959e-05, 4.976e-05, 4.993e-05, 5.01e-05, 5.027e-05, 5.043e-05, 5.06e-05, 5.077e-05, 5.094e-05, 5.111e-05, 5.128e-05, 5.144e-05, 5.161e-05, 5.178e-05, 5.195e-05, 5.211e-05, 5.228e-05, 5.245e-05, 5.262e-05, 5.279e-05, 5.296e-05, 5.313e-05, 5.329e-05, 5.346e-05, 5.363e-05, 5.379e-05, 5.396e-05, 5.413e-05, 5.43e-05, 5.446e-05, 5.463e-05, 5.48e-05, 5.497e-05, 5.513e-05, 5.53e-05, 5.547e-05, 5.564e-05, 5.581e-05, 5.598e-05, 5.614e-05, 5.631e-05, 5.647e-05, 5.664e-05, 5.681e-05, 5.697e-05, 5.714e-05, 5.731e-05, 5.748e-05, 5.765e-05, 5.782e-05, 5.799e-05],
        [5.580e-05, 5.603e-05, 5.625e-05, 5.648e-05, 5.671e-05, 5.693e-05, 5.716e-05, 5.738e-05, 5.761e-05, 5.784e-05, 5.806e-05, 5.829e-05, 5.852e-05, 5.874e-05, 5.897e-05, 5.919e-05, 5.942e-05, 5.965e-05, 5.987e-05, 6.010e-05, 6.033e-05, 6.055e-05, 6.078e-05, 6.100e-05, 6.123e-05, 6.146e-05, 6.168e-05, 6.191e-05, 6.214e-05, 6.236e-05, 6.259e-05, 6.281e-05, 6.304e-05, 6.327e-05, 6.349e-05, 6.372e-05, 6.395e-05, 6.417e-05, 6.440e-05, 6.462e-05, 6.485e-05, 6.508e-05, 6.530e-05, 6.553e-05, 6.576e-05, 6.598e-05, 6.621e-05, 6.643e-05, 6.666e-05, 6.689e-05, 6.711e-05, 6.734e-05, 6.757e-05, 6.779e-05, 6.802e-05, 6.824e-05, 6.847e-05, 6.870e-05, 6.892e-05, 6.915e-05, 6.938e-05, 6.960e-05, 6.983e-05, 7.005e-05, 7.028e-05, 7.051e-05, 7.073e-05, 7.096e-05, 7.119e-05, 7.141e-05, 7.164e-05, 7.186e-05, 7.209e-05, 7.232e-05, 7.254e-05, 7.277e-05, 7.300e-05, 7.322e-05, 7.345e-05, 7.367e-05, 7.390e-05, 7.413e-05, 7.435e-05, 7.458e-05, 7.481e-05, 7.503e-05, 7.526e-05, 7.548e-05, 7.571e-05, 7.594e-05, 7.616e-05, 7.639e-05, 7.662e-05, 7.684e-05, 7.707e-05, 7.729e-05, 7.752e-05, 7.775e-05, 7.797e-05, 7.820e-05],
        [8.162e-05, 8.179e-05, 8.196e-05, 8.213e-05, 8.23e-05, 8.247e-05, 8.264e-05, 8.281e-05, 8.298e-05, 8.315e-05, 8.332e-05, 8.349e-05, 8.366e-05, 8.383e-05, 8.4e-05, 8.418e-05, 8.434e-05, 8.451e-05, 8.468e-05, 8.485e-05, 8.502e-05, 8.519e-05, 8.537e-05, 8.553e-05, 8.57e-05, 8.587e-05, 8.604e-05, 8.621e-05, 8.638e-05, 8.655e-05, 8.671e-05, 8.689e-05, 8.706e-05, 8.723e-05, 8.74e-05, 8.757e-05, 8.774e-05, 8.791e-05, 8.808e-05, 8.824e-05, 8.841e-05, 8.858e-05, 8.875e-05, 8.892e-05, 8.909e-05, 8.926e-05, 8.943e-05, 8.96e-05, 8.977e-05, 8.994e-05, 9.011e-05, 9.028e-05, 9.045e-05, 9.062e-05, 9.079e-05, 9.096e-05, 9.113e-05, 9.13e-05, 9.147e-05, 9.164e-05, 9.181e-05, 9.198e-05, 9.215e-05, 9.232e-05, 9.249e-05, 9.267e-05, 9.284e-05, 9.301e-05, 9.318e-05, 9.335e-05, 9.352e-05, 9.369e-05, 9.385e-05, 9.403e-05, 9.42e-05, 9.436e-05, 9.454e-05, 9.47e-05, 9.487e-05, 9.504e-05, 9.521e-05, 9.539e-05, 9.556e-05, 9.573e-05, 9.59e-05, 9.607e-05, 9.624e-05, 9.641e-05, 9.658e-05, 9.675e-05, 9.692e-05, 9.709e-05, 9.726e-05, 9.744e-05, 9.76e-05, 9.777e-05, 9.794e-05, 9.812e-05, 9.829e-05, 9.845e-05, 9.862e-05]
    ],
    psu_dPM: [
        1.0, 1.09, 1.18, 1.27, 1.36, 1.45, 1.54, 1.63, 1.72, 1.81, 1.9, 1.99, 2.08, 2.17, 2.26, 2.36, 2.45, 2.54, 2.63, 2.72, 2.81, 2.9, 2.99, 3.08, 3.17, 3.25, 3.34, 3.43, 3.52, 3.61, 3.7, 3.79, 3.88, 3.97, 4.06, 4.15, 4.24, 4.33, 4.42, 4.51, 4.6, 4.69, 4.78, 4.87, 4.96, 5.05, 5.14, 5.23, 5.32, 5.41, 5.5, 5.59, 5.68, 5.77, 5.86, 5.95, 6.04, 6.13, 6.22, 6.31, 6.4, 6.49, 6.58, 6.67, 6.76, 6.85, 6.94, 7.03, 7.12, 7.21, 7.3, 7.39, 7.48, 7.57, 7.66, 7.75, 7.84, 7.93, 8.02, 8.11, 8.2, 8.29, 8.38, 8.47, 8.56, 8.65, 8.74, 8.83, 8.92, 9.01, 9.1, 9.19, 9.28, 9.37, 9.46, 9.55, 9.64, 9.73, 9.82, 9.91, 10.0
    ],
    fire_dPM: [
        [1.0, 1.09, 1.18, 1.27, 1.36, 1.45, 1.54, 1.63, 1.72, 1.81, 1.9, 1.99, 2.08, 2.17, 2.26, 2.35, 2.44, 2.53, 2.62, 2.71, 2.8, 2.89, 2.98, 3.07, 3.16, 3.25, 3.34, 3.43, 3.52, 3.61, 3.7, 3.79, 3.88, 3.96, 4.05, 4.14, 4.24, 4.33, 4.42, 4.51, 4.6, 4.69, 4.78, 4.87, 4.96, 5.05, 5.14, 5.23, 5.32, 5.4, 5.49, 5.58, 5.68, 5.76, 5.86, 5.95, 6.04, 6.13, 6.21, 6.3, 6.39, 6.48, 6.57, 6.66, 6.75, 6.84, 6.93, 7.02, 7.11, 7.2, 7.29, 7.38, 7.47, 7.56, 7.65, 7.74, 7.83, 7.92, 8.01, 8.1, 8.2, 8.29, 8.38, 8.47, 8.56, 8.64, 8.73, 8.82, 8.92, 9.01, 9.1, 9.19, 9.28, 9.37, 9.46, 9.55, 9.64, 9.73, 9.82, 9.91, 10.0],
        [1.01, 1.62, 1.84, 1.99, 2.12, 2.24, 2.34, 2.44, 2.53, 2.62, 2.7, 2.77, 2.85, 2.92, 2.99, 3.05, 3.12, 3.18, 3.24, 3.3, 3.36, 3.41, 3.47, 3.52, 3.58, 3.63, 3.68, 3.73, 3.78, 3.83, 3.88, 3.93, 3.98, 4.03, 4.08, 4.14, 4.19, 4.24, 4.29, 4.36, 4.41, 4.47, 4.52, 4.57, 4.63, 4.68, 4.73, 4.79, 4.84, 4.9, 4.95, 5.01, 5.06, 5.12, 5.17, 5.23, 5.28, 5.34, 5.4, 5.45, 5.51, 5.57, 5.63, 5.68, 5.74, 5.8, 5.86, 5.92, 5.98, 6.04, 6.1, 6.16, 6.22, 6.28, 6.34, 6.4, 6.46, 6.53, 6.59, 6.66, 6.73, 6.8, 6.87, 6.95, 7.05, 7.13, 7.21, 7.3, 7.39, 7.48, 7.58, 7.68, 7.8, 7.91, 8.04, 8.18, 8.33, 8.51, 8.72, 9.01, 9.88],
        [1.08, 1.97, 2.2, 2.37, 2.52, 2.64, 2.76, 2.86, 2.96, 3.05, 3.13, 3.21, 3.28, 3.36, 3.43, 3.49, 3.56, 3.62, 3.68, 3.74, 3.8, 3.85, 3.91, 3.96, 4.01, 4.06, 4.11, 4.16, 4.21, 4.25, 4.3, 4.35, 4.39, 4.43, 4.48, 4.52, 4.56, 4.6, 4.64, 4.69, 4.73, 4.77, 4.81, 4.85, 4.89, 4.93, 4.97, 5.01, 5.04, 5.08, 5.12, 5.16, 5.2, 5.24, 5.28, 5.32, 5.36, 5.4, 5.44, 5.48, 5.52, 5.57, 5.61, 5.65, 5.69, 5.74, 5.78, 5.83, 5.87, 5.92, 5.97, 6.02, 6.07, 6.12, 6.17, 6.22, 6.28, 6.33, 6.39, 6.45, 6.51, 6.57, 6.63, 6.69, 6.76, 6.83, 6.9, 6.97, 7.04, 7.12, 7.21, 7.3, 7.39, 7.49, 7.6, 7.73, 7.86, 8.03, 8.24, 8.53, 9.64],
        [1.18, 2.19, 2.4, 2.55, 2.68, 2.78, 2.88, 2.96, 3.04, 3.11, 3.18, 3.25, 3.31, 3.37, 3.42, 3.48, 3.53, 3.58, 3.63, 3.68, 3.73, 3.77, 3.82, 3.86, 3.9, 3.95, 3.99, 4.03, 4.07, 4.11, 4.15, 4.18, 4.22, 4.26, 4.3, 4.33, 4.37, 4.41, 4.44, 4.48, 4.52, 4.55, 4.59, 4.63, 4.67, 4.7, 4.74, 4.77, 4.81, 4.85, 4.89, 4.92, 4.96, 5.0, 5.04, 5.08, 5.12, 5.16, 5.19, 5.23, 5.28, 5.32, 5.36, 5.4, 5.45, 5.49, 5.53, 5.58, 5.62, 5.67, 5.72, 5.77, 5.82, 5.87, 5.92, 5.97, 6.02, 6.08, 6.14, 6.19, 6.25, 6.31, 6.37, 6.44, 6.5, 6.57, 6.64, 6.72, 6.79, 6.88, 6.96, 7.05, 7.15, 7.25, 7.37, 7.49, 7.64, 7.82, 8.02, 8.31, 9.64],
        [1, 1.45, 1.6, 1.71, 1.8, 1.87, 1.93, 2.0, 2.05, 2.11, 2.16, 2.21, 2.26, 2.31, 2.36, 2.41, 2.46, 2.51, 2.57, 2.62, 2.67, 2.73, 2.78, 2.84, 2.9, 2.96, 3.02, 3.08, 3.14, 3.2, 3.26, 3.32, 3.37, 3.43, 3.48, 3.53, 3.59, 3.64, 3.7, 3.75, 3.81, 3.86, 3.92, 3.98, 4.03, 4.09, 4.15, 4.21, 4.27, 4.33, 4.39, 4.45, 4.52, 4.58, 4.65, 4.72, 4.79, 4.86, 4.94, 5.01, 5.09, 5.16, 5.24, 5.32, 5.4, 5.48, 5.55, 5.62, 5.69, 5.76, 5.83, 5.9, 5.97, 6.04, 6.11, 6.19, 6.26, 6.33, 6.41, 6.49, 6.57, 6.65, 6.74, 6.82, 6.91, 7.0, 7.1, 7.19, 7.29, 7.39, 7.49, 7.6, 7.7, 7.8, 7.9, 8.01, 8.14, 8.28, 8.45, 8.69, 9.57],
        [1.08, 2.01, 2.23, 2.39, 2.51, 2.61, 2.71, 2.79, 2.86, 2.94, 3.01, 3.08, 3.15, 3.23, 3.31, 3.4, 3.48, 3.55, 3.63, 3.7, 3.77, 3.84, 3.9, 3.97, 4.03, 4.09, 4.15, 4.21, 4.27, 4.32, 4.37, 4.42, 4.46, 4.5, 4.55, 4.59, 4.63, 4.67, 4.71, 4.75, 4.78, 4.82, 4.86, 4.9, 4.94, 4.98, 5.02, 5.06, 5.1, 5.14, 5.18, 5.22, 5.26, 5.3, 5.34, 5.38, 5.42, 5.46, 5.5, 5.54, 5.59, 5.63, 5.67, 5.71, 5.75, 5.79, 5.83, 5.88, 5.92, 5.96, 6.01, 6.05, 6.1, 6.14, 6.19, 6.23, 6.28, 6.33, 6.38, 6.42, 6.48, 6.53, 6.58, 6.63, 6.69, 6.75, 6.81, 6.87, 6.93, 7.0, 7.07, 7.14, 7.22, 7.31, 7.4, 7.51, 7.63, 7.77, 7.94, 8.2, 9.19],
        [1.06, 2.32, 2.6, 2.8, 2.96, 3.09, 3.21, 3.31, 3.4, 3.49, 3.57, 3.65, 3.72, 3.79, 3.85, 3.91, 3.97, 4.03, 4.09, 4.14, 4.19, 4.24, 4.29, 4.34, 4.39, 4.43, 4.48, 4.52, 4.57, 4.61, 4.66, 4.7, 4.74, 4.78, 4.82, 4.86, 4.9, 4.94, 4.98, 5.02, 5.06, 5.1, 5.14, 5.18, 5.22, 5.26, 5.29, 5.33, 5.37, 5.41, 5.45, 5.49, 5.52, 5.56, 5.6, 5.64, 5.68, 5.72, 5.76, 5.8, 5.84, 5.88, 5.92, 5.96, 6.0, 6.04, 6.08, 6.12, 6.16, 6.2, 6.25, 6.29, 6.34, 6.38, 6.43, 6.47, 6.52, 6.57, 6.62, 6.67, 6.72, 6.78, 6.83, 6.89, 6.95, 7.01, 7.08, 7.14, 7.21, 7.29, 7.37, 7.45, 7.54, 7.64, 7.75, 7.87, 8.01, 8.18, 8.39, 8.69, 9.91]
    ],
    // Last updated as of 7/19/2024
    filament_price: [
        0.01, 0.03, 0.1, 0.3, 1.5, 4.5, 45
    ],
};
const firewallEncryption = (hp, rd, regen, ad, ms) => {
    rd /= 100;
    const cShort = [3.7027,100];
    const cMed = [8.2857,ad*3];
    const cLong = [13.421,ms*3];
    return [1000+hp*3, rd*3, regen*3*.3, (cShort[0]*cShort[1]+cMed[0]*cMed[1]+cLong[0]*cLong[1])/(cShort[1]+cMed[1]+cLong[1])];
}

const penTest = (port, cpu, aTPH) => {
    var t = 0;
    while (1) {
        const damage = cpu[0]*(1+cpu[1]-port[1])+cpu[2];
        if (port[0] - damage + port[2]*aTPH <= 0) {
            return t + aTPH*(port[0]+port[2]*aTPH)/damage;
        } else {
            port[0] -= damage;
            port[0] += port[2]*aTPH;
            t += aTPH;
        }
    }
}

const netBTCperHour = (idle, barter, crypto) => {
    const npcsPerHour = 27.69;
    // Based on 1 Hour of Grinding returns
    idle *= 3600;
    // Maximum bartering benefit is selling uncommons, assuming it is used:
    barter /= 100;
    barter = ((1+barter)*0.00864000-0.00864000) * npcsPerHour;
    // Hack bonus, similar to bartering
    crypto /= 100;
    crypto = ((1+crypto)*0.00180000-0.00180000) * npcsPerHour;
    return idle + barter + crypto;
}

const dPS = (dPM,level,rarity) => {
    var basePrice = stats.filament_price[rarity];
    const value = (level-1)*3*basePrice + basePrice;
    //console.log(dPM,rarity)
    switch (rarity) {
        case 5:
            if (dPM > 50) return (value).toFixed(2) + "~" + (value*2).toFixed(2);
            else if (dPM > 1) return (value + basePrice*3 - 1.928 * (dPM - 1) ** (1/2)).toFixed(2) + "~" + (value * 2 + basePrice + basePrice * 2 * 4 - 3 * (dPM - 1) ** (2/3)).toFixed(2);
            else if (dPM > 0) return (value * 2 + basePrice * 8).toFixed(2) + "+"
        case 6:
            if (dPM == 100) return (value).toFixed(4);
            else if (dPM > 50) return (value + basePrice*0.5 + 0.5 - 1.7 * (dPM - 50) ** (2/3)).toFixed(2) + "~" + (basePrice*1.5).toFixed(2);
            else if (dPM > 1) return (value + basePrice*3 - 16 * (dPM - 1) ** (1/2)).toFixed(2) + "~" + (value/45*68 + basePrice/45*68 * 4 - 20.3 * (dPM - 1) ** (2/3)).toFixed(2);
            else if (dPM > 0) return (value/45*68 + basePrice/45*68 * 4 - 20.3 * (dPM - 1) ** (2/3)).toFixed(2);
        default:
            if (dPM > 30) return (value).toFixed(4) + "~" + (value*2).toFixed(4);
            else if (dPM > 1) return (value + basePrice - 4.3 * basePrice / 30 * (dPM - 1) ** (1/2)).toFixed(4) + "~" + (value*2 + basePrice*2 - 4.3 * basePrice / 30 * (dPM - 1) ** (2/3)).toFixed(4);
            else if (dPM > 0) return (value*2 + basePrice*2 - 4.3 * basePrice / 30 * (dPM - 1) ** (2/3)).toFixed(4) + "+";
            // If there's no estimated price for it, chances are it's worth a lot
            else return "Invaluable";
    }
}

const dGI = (idle,barter,crypto,level,rarity) => {
    const item = stats.gpu[rarity];
    const bestGPU = netBTCperHour(item.idle[1]+stats.gpu_term[rarity]*level,item.bart[1],item.crip[1]);
    const worstGPU = netBTCperHour(item.idle[0]+stats.gpu_term[rarity]*level,item.bart[0],item.crip[0]);
    const actualGPU = netBTCperHour(idle,barter,crypto);
    const qualityRange = bestGPU - worstGPU;
    const actualRange = actualGPU - worstGPU;
    var gpuRank = 1+((actualRange/qualityRange)*9);
    if (gpuRank < 1) gpuRank = 1;
    return gpuRank;
}

const boostBTCperHour = (boost,rarity) => {
    var idle = stats.gpu[rarity].idle[1]+stats.gpu_term[rarity]
    idle *= 3600
    boost /= 100
    return idle*(1+boost) - idle
}

const dPI = (boost,level,rarity) => {
    const item = stats.psu[rarity];
    const bestPSU = boostBTCperHour(item.boost[1]+stats.psu_term[rarity]*level,rarity)
    const worstPSU = boostBTCperHour(item.boost[0]+stats.psu_term[rarity]*level,rarity)
    const actualPSU = boostBTCperHour(boost,rarity)
    const qualityRange = bestPSU - worstPSU
    const actualRange = actualPSU - worstPSU
    var psuRank = 1+((actualRange/qualityRange)*9)
    if (psuRank < 1) psuRank = 1
    return psuRank
}

const dFI = (hp, rd, rg, enc, level, rarity) => {
    const item = stats.firewall[rarity];
    const cpu = stats.cpu[rarity];
    const cpuV = hackPower(cpu.hack[1]+stats.cputerm[rarity]*(level-1), cpu.trueDam[1], cpu.pen[1], cpu.chance[1], cpu.dam[1]);
    const cpsAverage = 5;
    const bestPort = firewallEncryption(item.hp[1]+stats.fireterm[rarity]*(level-1),item.rd[1],item.regen[1],item.medium[1],item.long[1]);
    const worstPort = firewallEncryption(item.hp[0]+stats.fireterm[rarity]*(level-1),item.rd[0],item.regen[0],item.medium[0],item.long[0]);
    const bestHoldout = penTest(bestPort, cpuV, bestPort[3]/cpsAverage+.3);
    const worstHoldout = penTest(worstPort, cpuV, worstPort[3]/cpsAverage+.3);
    const actualHoldout = penTest([hp,rd,rg],cpuV,enc/cpsAverage+.3);
    const qualityRange = worstHoldout - bestHoldout;
    const qualityActually = worstHoldout - actualHoldout;
    var fireRank = 1+(qualityActually/qualityRange*9);
    if (fireRank < 1) fireRank = 1;
    return fireRank;
}

const hackPower = (hack, trueDam, pen, chance, dam) => {
    pen /= 100;
    chance /= 100;
    dam /= 100;
    return [(100+hack)+(0.05+chance)*(100+hack)*(0.3+dam), pen, trueDam]
}

const dCI = (raw, pen, trueDam, level, rarity) => {
    const item = stats.cpu[rarity];
    const port = stats.port[rarity];
    const bestHackPower = hackPower(item.hack[1]+stats.cputerm[rarity]*(level-1), item.trueDam[1], item.pen[1], item.chance[1], item.dam[1]);
    const worstHackPower = hackPower(item.hack[0]+stats.cputerm[rarity]*(level-1), item.trueDam[0], item.pen[0], item.chance[0], item.dam[0]);
    const best = port.hp/(bestHackPower[0]*(1+bestHackPower[1]-port.rd)+bestHackPower[2])
    const worst = port.hp/(worstHackPower[0]*(1+worstHackPower[1]-port.rd)+worstHackPower[2])
    const actual = port.hp/(raw*(1+pen-port.rd) + trueDam)
    const qualityRange = worst - best;
    const qualityActually = worst - actual;
    var cpuRank = 1+((qualityActually/qualityRange)*9);
    if (cpuRank < 1) cpuRank = 1;
    return cpuRank;
}

const percentile = (query, dist) => {
    //console.log(query, dist)
    var p = 100;
    for (var i = 0; i < dist.length; i++) {
        if (query <= dist[i+1]) break;
        else p--;
    }
    return p;
}

const dPM = (grade,rarity,type) => {
    switch(type) {
        case "cpu": return percentile(grade, stats.cpu_dPM[rarity])
        case "gpu": return percentile(grade, stats.gpu_dPM[rarity])
        case "psu": return percentile(grade, stats.psu_dPM)
        case "router": return percentile(grade, stats.fire_dPM[rarity])
    }
}
const dCPS = (type, rarity, mint, premium) => {
    const value = stats['filament_price'][rarity];
    //console.log(type, type in ["skxll", "navin", "zenko", "xenia", "shadowpriestess"])
    if (!type) {
        return mint > 3
            ? Math.max(((50*value)**(1/(1+Math.log10(mint)))-(mint/100)).toFixed(2),value.toFixed(2)) + "~" + Math.max(((100*value)**(1/(1+Math.log10(mint)))-(mint/400)).toFixed(2),(2*value).toFixed(2))
            : (mint == 3 ? (66*value).toFixed(2) + "+"
                : (mint == 2 ? (110*value).toFixed(2) + "+"
                    : (400*value).toFixed(2) + "+"));
    } else if (type == "skxll" || type == "navin" || type == "zenko" || type == "xenia" || type == "shadowpriestess" || type == "valenia") {
        return value;
    }
    else if (type.includes("name_")) {
        return mint > 1
            ? Math.max(((12.5*value)**(1/(1+Math.log10(mint)))-(mint/50)).toFixed(2),value.toFixed(2)) + "~" + Math.max(((25*value)**(1/(1+Math.log10(mint)))-(mint/200)).toFixed(2),(2*value).toFixed(2))
            : (25*value).toFixed(2) + "+";
    } else if (premium) {
        return mint > 3
            ? Math.max(((50*value)**(1/(1+Math.log10(mint)))-(mint/10)).toFixed(2),value.toFixed(2)) + "~" + Math.max(((100*value)**(1/(1+Math.log10(mint)))-(mint/20)).toFixed(2),(2*value).toFixed(2))
            : (mint == 3 ? (20*value).toFixed(2) + "+"
                : (mint == 2 ? (33*value).toFixed(2) + "+"
                    : (100*value).toFixed(2) + "+"));
    } else {
        return mint > 3
            ? Math.max(((50*value)**(1/(1+Math.log10(mint)))-(mint/100)).toFixed(2),value.toFixed(2)) + "~" + Math.max(((100*value)**(1/(1+Math.log10(mint)))-(mint/400)).toFixed(2),(2*value).toFixed(2))
            : (mint == 3 ? (33*value).toFixed(2) + "+"
                : (mint == 2 ? (55*value).toFixed(2) + "+"
                    : (200*value).toFixed(2) + "+"));
    }
}

const getItemGrade = (type, level, index, effects, dPM_flag=false) => {
    switch(type) {
        case "cpu":
            const hack = !dPM_flag ? effects["Hack Damage"] : effects["Hack Damage"] - stats.cputerm[index]*(level-1);
            if (dPM_flag) level = 1
            const trueDam = effects["True Damage"] || 0;
            const pen = effects["Hack Armor Penetration"] || 0;
            const chance = effects["Hack Critical Damage Chance"] || 0;
            const dam = effects["Hack Critical Damage Bonus"] || 0;
            const [raw, penV, trueDamV] = hackPower(hack, trueDam, pen, chance, dam);
            return dCI(raw, penV, trueDamV, level, index).toFixed(4);
        case "gpu":
            const idle = effects["Idle Crypto Mining"]
            const bart = effects["More Crypto Reward"] || 0
            const crip = effects["Better Barter"] || 0
            return dGI(idle, bart, crip, level, index).toFixed(4);
        case "psu":
            const boost = !dPM_flag ? effects["Crypto Mining Power"] : effects["Crypto Mining Power"] - stats.psu_term[index]*(level-1);
            if (dPM_flag) level = 1
            return dPI(boost, level, index).toFixed(4)
        case "router":
            const hp = !dPM_flag ? effects["Firewall Health"] : effects["Firewall Health"] - stats.fireterm[index]*(level-1);
            if (dPM_flag) level = 1
            const rd = effects["Firewall Damage Reduction"] || 0;
            const rg = effects["Firewall Regeneration"] || 0;
            const ad = effects["Firewall Advanced Encryption"] || 0;
            const ms = effects["Firewall Master Encryption"] || 0;
            const [hpP, rdP, rgP, encryption] = firewallEncryption(hp,rd,rg,ad,ms);
            return dFI(hpP, rdP, rgP, encryption, level, index).toFixed(4);
        default:
            return -1;
    }
}


const statsToEffect = (stats) => {
    let effects = {}
    stats.forEach((stat) => {
        effects[stat.name] = stat.value
    })
    return effects;
}

export let itemTodPM = (item) => {
    const index = rarities.indexOf(String(item.rarity).toLowerCase());
    const type = item.type === 'firewall' ? 'router' : item.type;
    const effects = statsToEffect(item.stats);
    const level = item.upgradeLevel;

    const standardGrade = type !== 'gpu' ? getItemGrade(type, level, index, effects, true) : effects["Idle Crypto Mining"] - stats.gpu_term[index] * (level - 1);
    
    const percentile = dPM(standardGrade, index, type);
    return percentile;
}


let nonCosmetics = ['firewall', 'cpu', 'gpu', 'cpu'];
export let apiItemToGrade = (item) => {
    const index = rarities.indexOf(String(item.rarity).toLowerCase());
    const type = item.type === 'firewall' ? 'router' : item.type;
    if(nonCosmetics.includes(item.type)) {
        const effects = statsToEffect(item.stats);
        const level = item.upgradeLevel;

        return getItemGrade(type, level, index, effects)
    } else {
        return -1;
    }
}

export let estimatePrice = (item) => {
    const index = rarities.indexOf(String(item.rarity).toLowerCase());
    const type = item.type === 'firewall' ? 'router' : item.type;
    if(nonCosmetics.includes(type)) {
        const level = item.upgradeLevel;
        const itemPercentile = itemTodPM(item);
        
        
        let price = dPS(itemPercentile, level, index);
        return price;
    } else {
        const mint = item.mint;
        const premium = item.premium;
        const price = dCPS(type, index, mint, premium);

        return price;
    }
}