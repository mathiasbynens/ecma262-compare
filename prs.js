"use strict";
var prs = {"458": {"login": "littledan", "base": "1d7f90e02ad218716125dcf19d7203b01913be4b", "ref": "copyless", "revs": ["ff2d343bf98e073d293de94a07028e0ad7680b68"], "title": "In the TypedArray(typedArray) constructor, copy only the needed portion"}, "452": {"login": "jmdyck", "base": "1d7f90e02ad218716125dcf19d7203b01913be4b", "ref": "editorial", "revs": ["cd80e2269281d4a87d335bfe2c0aaf6cc25cd0e5", "3d924dec44160d72bcf432bbff36a0180b70c730", "3a1fee160eac7c9e698d55654edbb279a982924b", "f029e51a8bb6c825cb4e9f33ef9bd203329e3b92", "119dfd36c35e7f056372fb012c24bb0e5507b1ea", "191ef81537d1625f7de39cbc3a1cbc8151b509cf", "cb32f03f1382251bb35150090b3ddd4307e11fb8", "8553f0a8d863cf1fc6708e491afeb667ed53d10d", "64cb754d051e78b105751e06a72e754ecd84813a", "cce651f59295c4d3b8b278f656d92aeabf2bcf2f", "aa41144bcafb1514704ec31f2d9f5b0cb03a6f69", "6a8bd1704d4ef38b2cef78a1c8520b0728b4a0ec", "2016212955ff3eff1966edd26669dac111bdb19c", "25def3d586cf6b6b0b456a68a97e2198d841045a", "81d6c98081f11a6dd14233df047af34177d79248", "061a29e87b231cc137e51802e292438da7bb58d1", "1161ffcb5a9da30895247fa510ac508efcaf6a21"], "title": "misc editorial"}, "453": {"login": "littledan", "base": "c9bad2925fc60fb0757c68afa2ed82a03e572e1e", "ref": "fib-dups2", "revs": ["e97ab859395ab0c5d510e2521d8cd105f4ac1e10"], "title": "Normative: Allow duplicate FunctionDeclarations in a block"}, "353": {"login": "anba", "base": "935dad4283d045bc09c67a259279772d01b3d33d", "ref": "define_nan", "revs": ["ed10f00476c6b0ded127e0aae5ae1f370053cfb6"], "title": "Always update object properties if the property descriptor is applicable"}, "456": {"login": "bocoup", "base": "e75390ddf547775242404c666f60a49e7f2818bf", "ref": "remove-unreachable", "revs": ["738fbb46a8e11da3b68ef9aa9218c9e223b5be01", "634a3215ebf46feb20783d7790ef4a8721555336"], "title": "[editorial] Remove unreachable branch"}, "498": {"login": "ljharb", "base": "1d7f90e02ad218716125dcf19d7203b01913be4b", "ref": "reflect_to_string_tag", "revs": ["33c774faa4d40e12c3cbe617139266152a5194af"], "title": "Normative: add `Reflect[Symbol.toStringTag]`"}, "494": {"login": "littledan", "base": "1d7f90e02ad218716125dcf19d7203b01913be4b", "ref": "regexp-original-flags", "revs": ["3bb821454581a38fb0dc4313045dc700487c163d"], "title": "Read global and sticky from [[OriginalFlags]] in RegExpBuiltinExec"}, "428": {"login": "anba", "base": "dd9bea197fe5b45533612b0eac69113d63a2c777", "ref": "typedarrayfrom_list", "revs": ["31b3ea2831da2c044e7b4ace013dbd1a93a302e9"], "title": "Allow iterables with more than 2^32 elements in TypedArray.from"}, "525": {"login": "msaboff", "base": "44adca8433fe7fb9163b7f535765f7b0def55e3d", "ref": "regexp-changes", "revs": ["101632eca50a655f886c0702ba93dbdb1882cd1c"], "title": "Unify handling of RegExp CharacterClassEscapes \\w and \\W"}, "508": {"login": "efaust", "base": "bdeb97ca492086b66e8646c431e4a6c2cdc176d0", "ref": "master", "revs": ["974421bb71e0108888e2735507e2d4590fb1dd81"], "title": "Allow cross-realm tail calls to consume linear resources."}, "410": {"login": "leobalter", "base": "1d7f90e02ad218716125dcf19d7203b01913be4b", "ref": "arraybufffer", "revs": ["b9b91b9b5d1c516c3b30bb1505904147eb3d2ac2"], "title": "Normalize TypedArray, ArrayBuffer and DataView constructors "}, "469": {"login": "claudepache", "base": "c9bad2925fc60fb0757c68afa2ed82a03e572e1e", "ref": "construct-return-primitive", "revs": ["21cc21d19dd7788069c202d6b248c8095707009b"], "title": "[[Construct]]: extends the check against non-undefined primitive"}, "522": {"login": "lars-t-hansen", "base": "44adca8433fe7fb9163b7f535765f7b0def55e3d", "ref": "agents", "revs": ["a67d79a6423ca02c6f7b015cc989487ea693c542", "664a250c1ff96de0ea40600c296f7b681f6dd3b4"], "title": "Add language to define Agents"}, "464": {"login": "jmm", "base": "e75390ddf547775242404c666f60a49e7f2818bf", "ref": "object-assign-method-function", "revs": ["e82fd8461a0ea9309d60916223b6d826df6e4b8a"], "title": "Only reference Object.assign as function, not method"}, "507": {"login": "bocoup", "base": "bdeb97ca492086b66e8646c431e4a6c2cdc176d0", "ref": "trust-resolve-export", "revs": ["3f51d2abef46c42c6abdb167bc6223b4bdbcd67f"], "title": "[editorial] Assert normal completion value"}, "485": {"login": "bocoup", "base": "e6d8185f908ee4406b4d437af51f43c13923a0cf", "ref": "prevent-rescue", "revs": ["cc462f4d7365c72a5af2e9d17363bef7337fe44a"], "title": "[normative] Prevent module binding \"rescuing\""}, "534": {"login": "michaelficarra", "base": "6a13789aa9e7c6de4e96b7d3e24d9e6eba6584ad", "ref": "GH-185", "revs": ["f2f03c77acc558e9074655a6f2451e066b36726d"], "title": "fixes #185: link methods referenced in well-known symbols table"}, "533": {"login": "michaelficarra", "base": "6a13789aa9e7c6de4e96b7d3e24d9e6eba6584ad", "ref": "GeneratorFunction-object", "revs": ["985f2aecad855ad07ab1854d12687dbf15737043"], "title": "Generator Function -> GeneratorFunction in 2 places"}, "474": {"login": "jmm", "base": "c9bad2925fc60fb0757c68afa2ed82a03e572e1e", "ref": "edit-b.3.4", "revs": ["3f65fa8763530705447619d17157076b599c7bab"], "title": "Edit B.3.4: fix typos & terminology, simplify language"}, "475": {"login": "jmm", "base": "c9bad2925fc60fb0757c68afa2ed82a03e572e1e", "ref": "normalize-strict-terms", "revs": ["31abd1d970b7b1278437e37fc0522c219c16aeba", "a19056fa2dd7976382415854e558fbf4051d6b0f", "95a6f61f7e97a2f72412f1b758f870c256a212e3"], "title": "Normalize strict terminology"}, "511": {"login": "littledan", "base": "44adca8433fe7fb9163b7f535765f7b0def55e3d", "ref": "regexp-compat", "revs": ["d1a4e24645fa2af5fbee232d464526636f95d23c"], "title": "RegExp.prototype not an instance web compatibility workaround"}, "510": {"login": "bocoup", "base": "bdeb97ca492086b66e8646c431e4a6c2cdc176d0", "ref": "sort-exports", "revs": ["bd72f4699f09b8200716205696037a07f40ad2bb"], "title": "[editorial] Specify order of module namespace keys"}};
