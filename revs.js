var revs = [
["2016-03-18 16:57:22 -0700", "703238399d339ceb7f894f4733626f601d42d05e"],
["2016-03-18 16:57:13 -0700", "f30d554e61821e447d68dbb44b5b66a0dc55f659"],
["2016-03-18 16:33:49 -0700", "58e1c0b7cf15c65dc9318d3acb4693f9bb989ef8"],
["2016-03-18 16:31:44 -0700", "427513881837719aadc97655dab0e7ed342360af"],
["2016-03-18 15:58:35 -0700", "b3faee8c6bfe589b880009c8e48eededb9605394"],
["2016-03-18 15:47:37 -0700", "c857bba58d3d183944521f3fb97a2c82e2bf39c9"],
["2016-03-18 18:09:01 -0400", "e6d8185f908ee4406b4d437af51f43c13923a0cf"],
["2016-03-17 14:08:35 -0700", "0c1bd3004329336774cbc90de727cd0cf5f11e93"],
["2016-03-17 14:08:23 -0700", "a34229a73bf64da67a001ee38273428c73de831f"],
["2016-03-17 13:52:56 -0700", "fc1715a95e3a85a6de2d13f61e79c18694071911"],
["2016-03-17 13:13:09 -0700", "982a67cf5cccd5c09609ddedf44ca1dfacdd3cfa"],
["2016-03-17 13:13:08 -0700", "83701417f59773f316246c545fb4e029601abf9d"],
["2016-03-08 16:56:07 -0500", "c9bad2925fc60fb0757c68afa2ed82a03e572e1e"],
["2016-03-07 09:12:31 -0800", "349e61e60c80f3c350aa3985352ff6ad1cb3a478"],
["2016-03-02 17:09:16 -0800", "e75390ddf547775242404c666f60a49e7f2818bf"],
["2016-03-02 12:50:52 -0800", "45e5880954755ab90013170cc4bf0ed75d9d4a85"],
["2016-03-02 12:46:31 -0800", "322dd9e19209f97f74ece06f68dbfd75a8e8d814"],
["2016-03-02 02:08:34 +0200", "6af9c9eb147606fa2de11a09c3176946bbaae2fa"],
["2016-03-01 15:15:01 -0800", "3c3c8de1234f6585f8d838a87e4fde632341a687"],
["2016-03-01 14:28:39 -0800", "245e11eb8b4a84e2d6464414a9d3ae1a158598a5"],
["2016-03-01 14:04:19 -0800", "93497afdf4957b876a228a0922a3a21d2d34f739"],
["2016-03-01 13:56:14 -0800", "e6284b9bd6977ca282bdf13d13fab4d8bf6be71b"],
["2016-03-01 13:49:46 -0800", "cfd0fff9680f2bb8efcc4a45a481114cc2d8e3c1"],
["2016-03-01 13:47:58 -0800", "442e4351bc2733a4d0169b8c92c134c40fe48f0e"],
["2016-03-01 13:45:13 -0800", "29eb1c7179ca0c6386c57221824e77db5295102a"],
["2016-02-29 15:54:55 -0800", "04967df2b6f5fc96bd669b2d14bc24f416587794"],
["2016-02-29 15:32:03 -0800", "5194c35aec25e3ac4ba41cb3673c24998db8ca6b"],
["2016-02-29 15:13:46 -0800", "1322144f4e7174e3cd5eb6bf6df0019b5a3fdc07"],
["2016-02-29 14:50:54 -0800", "cd7516e14289263b975ab0842886683767ac43bc"],
["2016-02-29 14:49:56 -0800", "060bd56d23c12515804202c53211abd0fd8de647"],
["2016-02-29 14:49:36 -0800", "da2be292e2ea780e74600b36daaee032e3c75020"],
["2016-02-29 14:47:49 -0800", "1e5538c452fc22afd8dfad2046286fed5427ec65"],
["2016-02-29 14:47:01 -0800", "6838308fcd615311ab4a2dd412bd565d26ddef36"],
["2016-02-29 14:46:37 -0800", "9fc8828744814372bcc314da2993d7f84b1441d8"],
["2016-02-29 14:46:31 -0800", "fae4aab003d9538f113d1e17bbaacd5d8231c563"],
["2016-02-29 14:46:26 -0800", "9e1506413a17ad46b799f740645d265c9a59cd8b"],
["2016-02-29 14:46:19 -0800", "f623ed649d2cc1d0157875aee75e84c79c81f534"],
["2016-02-29 14:40:09 -0800", "0fa7442859a979ecaaef3a8241b7c9465bef208b"],
["2016-02-29 14:40:03 -0800", "6d76c3f28911193603c6f2e878de38830db46c3a"],
["2016-02-29 14:39:57 -0800", "283a2853e40d1e7a2ab77e135717735b3ae4699b"],
["2016-02-29 14:39:52 -0800", "d6effa04bfa9631f1dc49e41cf689b952bec4606"],
["2016-02-29 14:39:46 -0800", "87f10cb568dfc5561f58e92837128553aac307fd"],
["2016-02-29 14:39:40 -0800", "9570978072d8523f57a321a502d2f3e6449e16b4"],
["2016-02-29 14:39:34 -0800", "690bcd9c4a1341d3b4670e9fcf7685d24aac1e18"],
["2016-02-29 14:39:26 -0800", "928665d0db93204f7698c5e85f3b531fa83d3780"],
["2016-02-29 14:35:05 -0800", "f6fcf4ee0a6a2d7bf9e139acd985a6a75dfdb99c"],
["2016-02-29 14:34:35 -0800", "ceef6b670ae6646c84d0986eacf399c1b27ad017"],
["2016-02-29 14:34:28 -0800", "03043b32ac08289198f36c5527712f83372925e2"],
["2016-02-29 14:34:10 -0800", "d82fc53eac1053aa8104e4ce178dc46348316321"],
["2016-02-29 14:34:04 -0800", "87df93468decdc3fd4006e6aa89bffdb2e251968"],
["2016-02-29 14:33:57 -0800", "a107f09a156e8eeef725061fec19ada715b065bc"],
["2016-02-29 14:33:52 -0800", "6f7941585f782f1c3d747d8dc5c3c67a8405b98e"],
["2016-02-29 14:33:46 -0800", "0c249b91e1a92e019e0ddec07e5c84c9c471f035"],
["2016-02-29 14:33:38 -0800", "371d6ae36c8b43672ee60cc7885440fa0e86c99d"],
["2016-02-29 14:29:28 -0800", "0533246ee7e77e63467bf658493e62b930c2b5ef"],
["2016-02-29 14:28:16 -0800", "c681386bdc19522e27231e2e3b267d7178fede4e"],
["2016-02-29 14:24:26 -0800", "13cce7596f317d1f3c9c08e1a1d65fa440d3b5ee"],
["2016-02-29 14:23:29 -0800", "9e356498c94b0bb36894aa3f004c05c58c2e8d0c"],
["2016-02-29 14:23:22 -0800", "37197095d6fc75511d9e3d225867b639a8a9c63a"],
["2016-02-29 14:23:15 -0800", "a316f54a990d7d9306d5b7079329189d227ad432"],
["2016-02-29 14:23:09 -0800", "fefaf3cb82afc99beb676dc9b6e01612c39aa3c5"],
["2016-02-29 14:23:02 -0800", "b96598f289c45b365f2c6884e8e07df67b39c4eb"],
["2016-02-29 14:22:57 -0800", "1049b36e48751004511db7e52ae0f6a869848120"],
["2016-02-29 14:17:22 -0800", "b753a4fa3221efcc16fe4430f27d5ab8d4cca6ca"],
["2016-02-29 14:16:38 -0800", "bb5294eeb6fef9d066c655dfe7c7481bc2858133"],
["2016-02-29 14:06:06 -0800", "b7b7ff5819b57cd674227fc7405254a9d575db8a"],
["2016-02-29 14:03:56 -0800", "79033f8cbeb38cd6f7d73f4e7b94ed57ee71ae81"],
["2016-02-29 14:03:24 -0800", "fff0b1db8526807f3989799175b06046143e4876"],
["2016-02-29 14:03:14 -0800", "f612ad2f65c0cd61411c2fe574a7526e8e8f1b31"],
["2016-02-26 16:47:44 -0800", "dd9bea197fe5b45533612b0eac69113d63a2c777"],
["2016-02-26 15:11:50 -0800", "6ef0ee31579c3eac0fba8fcef3028a7d94acfbd6"],
["2016-02-26 10:50:49 -0800", "7ba2fecff2af4e7281fd420d31545e0f52e7efc0"],
["2016-02-25 09:30:55 +0100", "0ae7212cd664b75dd2b41f1cea7039b85b326c15"],
["2016-02-24 12:51:15 -0800", "2d2521ad95b43a98c02ac49cf23ee39dbf4fce06"],
["2016-02-24 11:24:35 -0800", "22405abb1019de1a99fde8be0507d8127bb859ba"],
["2016-02-24 11:22:58 -0800", "6e8102f54fca78ba1180354d73adbcf0cc9903bf"],
["2016-02-24 11:22:25 -0800", "a2f6bfd7c547a306f428f9ecde9baf5fe04f2c8f"],
["2016-02-24 10:55:39 -0800", "28c52378f6bf54fafa475f76c20a2c3a48a4cdba"],
["2016-02-23 16:02:53 -0800", "05ca4b742a831cbcff017c5b8f15c23d8c5f62e7"],
["2016-02-23 18:30:01 -0500", "1c4f5f9fdfc59bd9305b3d2d31a8460791580228"],
["2016-02-22 15:42:42 -0800", "ae8f4875a0f7d3adcd838fbee76b792fc58f5067"],
["2016-02-22 14:53:24 -0800", "7ecb8b18f0c8867bab288a6580f6390adfef2f84"],
["2016-02-22 14:43:57 -0800", "a5af3a626160db63bda2cfd1e797269c3394e905"],
["2016-02-22 14:16:24 -0800", "f0ef98ae9ecdfd1ed1e14721e795f6188a3107ee"],
["2016-02-22 11:28:50 -0800", "5457a2f931f53d7f115a0773dd27475da57e954f"],
["2016-02-19 17:33:32 -0800", "471d28b9af57476cca9f254dbb24b17da2eaaa74"],
["2016-02-18 11:54:19 -0800", "6ba35eb8fb9aad699efdd1766c52bc9f6401d039"],
["2016-02-18 11:39:21 -0800", "b72b85e657024e14aafd316af24123e336559f34"],
["2016-02-17 15:03:31 -0800", "b11cf639a179e26b7cc9f5a7d559d94607fd6d01"],
["2016-02-17 15:03:14 -0800", "d457e11089407d3e5d044bb00a4425a5ac5b28d3"],
["2016-02-17 12:53:33 -0800", "56954ad65fd2c1514113cf7452452693b2a9c842"],
["2016-02-17 12:52:52 -0800", "864d7f4126b6d5e8a8b63e98b19cd725bde83dd3"],
["2016-02-12 10:06:08 -0800", "4833fd41a7a1ba13470b1dc8bf09b528ad72e737"],
["2016-02-12 12:18:52 -0500", "2d3a8a2a7b87a69ad479c8edc4d7f147cd0c1c3b"],
["2016-02-11 17:13:21 -0800", "d96e60a99a40fab2de0df329b3e5445ac27b8a8e"],
["2016-02-11 16:29:58 +0100", "7960e544c16322badb46b8bcfaef3ba8b0b0017b"],
["2016-02-10 14:51:57 -0800", "24dad16327b7cbbdf67805e45e58c54abe558f63"],
["2016-02-10 14:23:58 -0800", "51fb88733072c25612040a0e94c1eb110c2c3e59"],
["2016-02-10 11:22:27 -0800", "121578ecbbb47dc9209226a519632a9b93274ee0"],
["2016-02-10 11:07:34 -0800", "611a4fc25583b3ec574742c3358f2a4746b3fdea"],
["2016-02-10 10:57:47 -0800", "d58637b61f3d0ff8ae748ee31749a6e820e3d8e3"],
["2016-02-09 17:08:22 -0800", "fa8ac0558b6714ad336aba8eb8efc9c016a7d94c"],
["2016-02-09 17:08:20 -0800", "e89f83c086f75dcd38407155b3624295e5d51c5d"],
["2016-02-09 15:57:45 -0800", "ae020983ea79701d7de35819b456e686c9bc4792"],
["2016-02-09 15:52:25 -0800", "f746daa5dae8f0e145d78e79768b9fe869a7ae70"],
["2016-02-09 15:44:48 -0800", "2b61c8719c210d2381b9f62728baaf823cb48907"],
["2016-02-08 16:40:51 -0800", "89fbe7fe9ab3812844907cacf848bfd2933c8082"],
["2016-02-08 15:55:25 -0800", "573e382510ef582868f82e18c29ee83cd8772646"],
["2016-02-08 15:53:19 -0800", "5c0eb7ea3448e08a051ede584d9934d0e22fc552"],
["2016-02-08 15:51:35 -0800", "3a86c45548809aed2297a05bf8cc5376af5e0f26"],
["2016-02-07 20:38:58 -0500", "2a1959996a28698aeaf34d2dfa6551372bacb3a5"],
["2016-02-07 20:36:12 -0500", "8220c488f3b378d73bc2da0ffd152b548656c2d6"],
["2016-02-05 17:09:23 -0800", "1e715656f727399d7ae8f622bcdb271aa5fe2a52"],
["2016-02-05 14:36:17 -0800", "28bdf0798662bcb8efb11c4070f8a981a496ccc1"],
["2016-02-05 14:13:48 -0800", "eb0615ea028000d84f3d5dcd9d94a74558d3a206"],
["2016-02-04 17:41:59 -0800", "dfeaa393214abcffdde8e2d900b70938852d2934"],
["2016-02-04 17:41:27 -0800", "ff1f5f134f9b731eec0982198b5ae0ad733198b6"],
["2016-02-04 17:34:14 -0800", "412bd513d3e720c41d4af27695cc6835f6c1d569"],
["2016-02-04 16:49:26 -0800", "2be37ad1a97f5ed4c53b2711494ffd525e61ec47"],
["2016-02-04 14:59:46 -0800", "2c1854e942b62cabae2812a2fce3536169fa0e2f"],
["2016-02-04 12:58:21 -0800", "15ad1386d7a44232e67aee66332994fe594e5364"],
["2016-02-04 12:54:09 -0800", "31593103e9db9bcfc4742864d0d33f9fa8b566c7"],
["2016-02-04 12:47:08 -0800", "da0f77225c25f8299e25f2797fa768e754514a67"],
["2016-02-04 12:34:42 -0800", "38f829fbd50d70e7582bed4c6a10733ad641f38d"],
["2016-02-04 12:34:35 -0800", "18f9652656fa7124c3cf380ad47934ed9b93105a"],
["2016-02-04 12:34:26 -0800", "3b3c2687a4e92450eae789015ed6d85f877510d2"],
["2016-02-04 12:34:19 -0800", "5ee6f14c7ae7d2d9f2a6436a797bc8a366423277"],
["2016-02-03 16:55:00 -0800", "935dad4283d045bc09c67a259279772d01b3d33d"],
["2016-02-03 14:44:49 -0800", "6bf9aabf412bca7893fde4c19b7fb84f4967c506"],
["2016-02-03 13:02:54 -0800", "fbdfda6f2a613f3c4813d4b34e32f5c5134cf921"],
["2016-02-03 12:07:33 -0800", "e1e7cdc77ef0d7077ac8ab76ff9fa577b6a1db14"],
["2016-02-03 12:04:25 -0800", "1c970e9817191f9301df39f115c5a83468063042"],
["2016-02-03 12:02:45 -0800", "a6f3f56e5bfd4c525d770b8a4c7fe5635d4d0b5f"],
["2016-02-03 12:00:51 -0800", "a0fbda92cba7c9bd26bd72820c461d5f9b143566"],
["2016-02-03 12:00:23 -0800", "08366b923ca663d9be3e330ab7760e3b015e8838"],
["2016-02-03 12:00:09 -0800", "285d3f3a48a1f6e36330de75fc2cce6c227e4868"],
["2016-02-03 11:58:02 -0800", "50ec9b4195df6caf4da2352e0edb19024b515f2d"],
["2016-01-29 11:03:13 -0800", "7925ed05e6746fafdeb4416c8d4341b08ab97fc1"],
["2016-01-28 14:44:52 -0500", "82bebe057c9fca355cfbfeb36be8e42f18c61e94"],
["2016-01-27 16:15:10 -0800", "8d7995d6f7538534f2a54af4811c939ac8614676"],
["2016-01-27 16:12:49 -0800", "2c4834a076bd037d858219fdea74cb2407a7cef3"],
["2016-01-27 16:11:23 -0800", "f99c60f3cb68da5ffa47cd5e76719f5c4e8b0e91"],
["2016-01-27 16:09:17 -0800", "78e131a7a6a1f47cff152f447202e4b15e30fb54"],
["2016-01-22 11:51:19 -0800", "45a0bb13f2604c585cfc469244dea64e340fe4f0"],
["2016-01-22 11:47:27 -0800", "34b94d03552c30dc4510a8991659e3a29a1dc020"],
["2016-01-22 11:47:25 -0800", "59fca3269969a3a63608f8773ca3163695d2fdde"],
["2016-01-21 15:14:49 -0800", "70562e82b7a8880375fec44f35facb174ebebed9"],
["2016-01-21 15:13:13 -0800", "5bc26c1c885267d4a73a08e912546ac94ec1cd92"],
["2016-01-20 16:18:05 -0800", "50fb08580cef962ede3a4fae942c4b6a633b7243"],
["2016-01-20 16:06:44 -0800", "98569952a97f74378b656d9c7d4dc8693d0189a0"],
["2016-01-20 15:53:11 -0800", "ab923fe44352daf2a8b1d81bf1b763ba578fa90b"],
["2016-01-20 15:53:04 -0800", "6593f3f1f4d790074673982bd1955307921bc1fd"],
["2016-01-15 17:07:11 -0800", "75d74f20419d767ee73679887eca4ec681bc3cca"],
["2016-01-15 16:10:19 -0800", "d830481500fe9b1e33cfdb5dbd1fe28934c559cb"],
["2016-01-15 16:09:34 -0800", "2fb8d0870dfd702c6104c5c98598569da8e0b203"],
["2016-01-15 16:09:20 -0800", "dc2521c3b3aac8ca860185e16adcb6ddb3f578f6"],
["2016-01-15 15:27:11 -0800", "eac27afaa5f3cd27fa8128803f3a2951548f3441"],
["2016-01-14 18:25:46 -0800", "518c5814667440d160f75f35f701563d4f1f321d"],
["2016-01-14 17:26:01 -0800", "246e73574d600d09b72aa7242f7a90d458da5cc7"],
["2016-01-14 17:14:09 -0800", "14e3617df5a4d0bf83ac166b9fb0ef17291898bc"],
["2016-01-14 16:52:47 -0800", "d623a10041f8ddd0952982890cf3680ca7ad65b6"],
["2016-01-14 14:54:06 -0800", "731adfb30ad741e38484d07862f20b64604f4822"],
["2016-01-14 13:27:50 -0800", "26aabf616f1061994c084979e79f86bee47d75cb"],
["2016-01-14 13:25:54 -0800", "e840e389e2d2d77630e62dad8fc42e9532c40777"],
["2016-01-14 12:58:48 -0800", "7cb80f5f5aa6ed301126f9175565e6a222a75506"],
["2016-01-12 13:35:23 -0800", "2e22335de2f99baceb3b52ebac54319087f6e96d"],
["2015-12-30 10:52:23 -0800", "3fe48973a59c1a8b3420c67b7a3ef6cb5aaa971f"],
["2015-12-30 10:46:26 -0800", "5881aef23b611699e9d6b12ce77651f3ded6e855"],
["2015-12-30 10:46:15 -0800", "58f40c1933ae4323511244574ec2654d46fccc29"],
["2015-12-30 10:44:55 -0800", "788a2eb4c5419e116b17a4cdc8b2f345e0578261"],
["2015-12-27 06:37:54 -0800", "f3743b5d7e978457b1a0e9098a6fe05e0ffbc8e4"],
["2015-12-27 06:28:44 -0800", "7def9d137c26b6a80f9f689851d6365ae61baf0b"],
["2015-12-27 06:24:06 -0800", "9405a43e25bed1a9b9d57d8bfde2680e4ed3e3bb"],
["2015-12-27 06:22:04 -0800", "dfdd127e9b88206c077adf5e9670689109e461c6"],
["2015-12-26 18:15:05 -0500", "776f41fbfbf6f359b8fb1711458a9d2938cec54a"],
["2015-12-20 11:32:15 -0800", "ce867bc769b4ae1eb735d501b44bd6623fe685cb"],
["2015-12-20 11:34:57 -0800", "a4716fde8ea4188e09365ecd2760d5e21c0cb0fa"],
["2015-12-20 11:06:14 -0800", "5512445d776b006c484c25c27d795f0f5033b58c"],
["2015-12-20 10:57:23 -0800", "166ab2b1c279b107d30e9f078b70eca8bc6ab67a"],
["2015-12-20 10:53:04 -0800", "7c680e10ac00a53521ed75669ec7a06af878e95b"],
["2015-12-15 13:13:38 -0800", "04adac809bd6c28ed361f009faf826038609f39c"],
["2015-12-15 13:12:20 -0800", "5371c1538cc37a32718fc1e7b7d6f840ab1213a0"],
["2015-12-15 12:32:36 -0800", "2e8fd2155b78a8893791354a713f01ca58aa4e2b"],
["2015-12-15 12:09:31 -0800", "5fd2e72ed2e3fcb107356e9553075aac629f38f6"],
["2015-12-15 11:55:06 -0800", "698819cbf1d79a58532a66ecfe5feaca67cb3112"],
["2015-12-11 10:36:59 -0800", "f150ac951157b7c54e48279d8e1fa46271ccf462"],
["2015-12-10 14:10:22 -0800", "b8f06ea3fcefe1a29fa263833d3fab3e9784f8e6"],
["2015-12-10 11:43:22 -0800", "bb7f0c1a53e7e3a034656bab1279c586a356711d"],
["2015-12-10 11:25:27 -0800", "06998ea13f055a6d05da94f2bdf7b49174cd6946"],
["2015-12-09 17:02:03 -0800", "2a1804da4083580788c645e8ac51d18c38f3fbc1"],
["2015-12-09 16:57:20 -0800", "3f142a7fc2f50f544a1c391b71564bd5023c6222"],
["2015-12-08 15:59:39 -0800", "fdd3a4fd7172e3c46a7c19dccff3a5a3315ce208"],
["2015-12-08 15:31:59 -0800", "889135045b0789dcc702e55396e32732ffe6bbbc"],
["2015-12-08 14:10:42 -0800", "b3dad8b1cd80e3e90654f568d9b54d8de01df5a0"],
["2015-12-08 14:02:09 -0800", "5921ef9ff363d679a2271cbbe05a6103ad4c3ccc"],
["2015-12-07 22:33:24 -0500", "eacbc9d06cfc453a51d22d7980ec893a5c7e2de0"],
["2015-12-07 22:29:10 -0500", "9474c58c6baf54e8b5347a182c2fa6ee10dab071"],
["2015-12-07 22:29:04 -0500", "b1ef33bf40a324dcd8cd92d2bcc6e08c7074978d"],
["2015-12-07 13:34:17 -0800", "1046a423adf3ea9c5460cdbdf3a9c156f52f1632"],
["2015-12-07 13:22:08 -0800", "c7868ce5303e195a9d9b66ffd475788740cd09e9"],
["2015-12-04 04:31:03 +0300", "c6a2d1e63c8682efe650bfb72e8927781ee82812"],
["2015-12-02 14:57:44 -0800", "175da1425a390cde332797e03557003bcab14511"],
["2015-12-02 14:53:53 -0800", "67b8faa732bf623f1ea994b4d1e91c341c6e97db"],
["2015-12-02 14:44:19 -0800", "19838b9e172e2eb515fc148c7b2fa48482148935"],
["2015-12-02 14:29:35 -0800", "273818bac034d6b9c80343add7342a89fd5fde95"],
["2015-12-02 14:27:23 -0800", "058cc7028388c078351c78a6a5ef229a7b1fb946"],
["2015-12-01 16:15:35 -0800", "c35897c15344645672b5182e580e9c991725448e"],
["2015-12-01 16:11:50 -0800", "0967d7bf3758cda0ec4c06c366c5118d1fad8207"],
["2015-12-01 15:59:53 -0800", "994f2129adbbbea78ea6776db698aa4874d251fe"],
["2015-12-01 15:54:31 -0800", "160d26111057d1f8f390e4489c98025e70e714f1"],
["2015-12-01 15:53:23 -0800", "c34f0b6afbd7c0934be5118e281030b46fc464dc"],
["2015-12-01 15:52:21 -0800", "61f3fc33e44cf6a76f514f4d9df0f3f9eeb31cca"],
["2015-12-01 14:48:06 -0800", "02455e5e2964f62b13818c6fd23289381ecafdf8"],
["2015-12-01 14:22:25 -0800", "3bb7717b3225c1b4d6e0ada070e7fe954baf0e4a"],
["2015-12-01 14:14:39 -0800", "c8102ed792df46aa0b90635dcf9eb5ae90847a1f"],
["2015-12-01 14:07:02 -0800", "c2d7e26671d92bc244ea8d19936ff85f35cb59b8"],
["2015-12-01 14:06:51 -0800", "c02b3f0325da3530188fa8718e3d3a37edeff3ee"],
["2015-12-01 10:09:35 -0500", "aa7637f96429f0c324b0ff29c8ef05f2d9fdb91b"],
/*
["2015-11-30 18:44:15 -0800", "d6c6681c2682eb2a91fae0627ef691d6b5465e38"],
["2015-11-30 14:53:49 -0800", "e89e31d60feaed57f0450a929ef6a0a6138f1204"],
["2015-11-21 11:19:16 -0800", "3b582aff7d50e94bf34c0755e8b66579e9ab3e05"],
["2015-11-21 11:13:45 -0800", "62e01afcef1590baa94505ba4fcf7800230da799"],
["2015-11-21 11:08:43 -0800", "c8b4aee68332b019dde2398bdf613f7a223f8968"],
["2015-11-21 11:08:41 -0800", "89b2e62f2d7e4f82382403eb668b031b0a538911"],
["2015-11-19 15:54:31 -0800", "a7004628798f91d27c3483d65901618586db6ebd"],
["2015-11-19 15:54:14 -0800", "3fc7f78de09e9414dc2b8527eb69d9c014301897"],
["2015-11-19 15:53:39 -0800", "e88bd7fd08794e6104ea59c82782b66b8feacdf6"],
["2015-11-19 15:26:08 -0800", "bd62392a15a1be6d21ca9f3bb00913d1938b9f93"],
["2015-11-18 14:37:39 -0800", "cb59bed9cc0f91a5b7986c6d72948d6d4decb4eb"],
["2015-11-17 11:33:37 -0800", "a2a9a5231834872d2fb17f47cd6e82a4427e2b71"],
["2015-11-16 12:55:42 -0800", "f742673c1176523c7c380f724fd7bc862f0cacd8"],
["2015-11-16 10:00:07 -0800", "6f5c8e5744f8baebd2fe785d852c048e0f4e2eb1"],
["2015-11-13 10:05:54 -0800", "a524713c908da968f5bf36fa820ce6673a261d38"],
["2015-11-12 14:23:15 -0800", "15b0db41edd0e519e94668bf13765fe458840766"],
["2015-11-12 12:54:31 -0800", "d322357e6be95bc4bd3e03f5944a736aac55fa50"],
["2015-11-11 13:46:23 -0800", "bddde2330989a5a8daf26b37963f668bb3382371"],
["2015-11-11 11:09:26 -0800", "063ca7b083d9a4c677c3cdb402496436d4d7abaf"],
["2015-11-11 09:28:08 -0800", "ea73ba82980db888642e65f460b2b90bccabc896"],
["2015-11-11 09:23:57 -0800", "1b2ecf488942afa30547a8916eead2c10bac83f4"],
["2015-11-10 22:38:23 -0800", "c67a000d7a2ff83481b04b58c10bb4e2e44bc7e0"],
["2015-11-10 22:37:43 -0800", "791e11ebecd42439d20d9f9bc332f03a76b6b73b"],
["2015-11-10 11:17:21 -0800", "02e46aba2f9f5daf484d2811d0c5c67f81c6ed23"],
["2015-11-09 09:26:47 -0800", "01aaffe48790de79ea972a6c650b731329d6ab01"],
["2015-11-09 09:24:20 -0800", "748ec83c5c36414b9455b87ddba3ba2eba686edc"],
["2015-11-06 11:57:13 -0800", "6844342f1815db6de559a38c3abf52d74283fdfc"],
["2015-11-03 14:54:29 -0800", "651f63224407a1a8da952c5f754ba2c53e118fbc"],
["2015-11-03 12:01:44 -0800", "8e82cfbe529623d891b38ca4770e5169dc24857f"],
["2015-11-03 11:57:59 -0800", "0e423efee01045a5ca53f6c7e5b6abdd037fdb40"],
["2015-11-03 11:54:29 -0800", "3a0008963811753c3b606345f06cafa63d0dd484"],
["2015-11-03 11:52:45 -0800", "b8f26332b95cd7db0699cafe88ed9398a3584d5f"],
["2015-11-03 11:47:34 -0800", "3158957553722c1cfe30ebcf44062fc4c4e4031f"],
["2015-11-03 11:46:22 -0800", "e674cf6e69ed49d8494895e3822c33107f7dd525"],
["2015-11-02 18:16:51 -0800", "c2b36f49949aae8830d0c57053a24b97728bc623"],
["2015-11-02 18:14:53 -0800", "5c1984334d6d42538527bd022e68bfbfee5cb652"],
["2015-11-02 18:12:10 -0800", "b3d8f5b66c93db373ee1e89b144d3062448783f4"],
["2015-11-02 18:09:43 -0800", "cdab871bed5cc5c9ba43dd3e403a5285df898d23"],
["2015-11-02 18:07:16 -0800", "b878bbf1e40522aaf79847af733827702eace01d"],
["2015-11-02 18:04:49 -0800", "b48d9da9c519ff3357e62f4a5fdcd6f2e57170c4"],
["2015-11-02 18:01:29 -0800", "fa0d8292cbb51c4bfbaa416c185d1a8f6745e194"],
["2015-11-02 17:55:01 -0800", "08b4756747f9c967058239df627da544412740a6"],
["2015-11-02 14:58:00 -0800", "bdc939883ddb71e1ea0f0ee40b87642f51c9caf2"],
["2015-11-02 14:55:04 -0800", "efbfc88a9668cb8750422978299072406166582e"],
["2015-11-02 14:47:22 -0800", "04e2e9b7197a33612202e85065e3f8d8385fbcef"],
["2015-11-02 14:42:49 -0800", "a2bb171e59c353b78d3a501b648f4498a7825681"],
["2015-11-02 14:39:11 -0800", "9c1e076c8050afb40cc68bf9af242adf6f9880a8"],
["2015-10-28 16:47:51 -0700", "4f4a37a211ed44aeffb31cc3dcbe56096c949154"],
["2015-10-27 15:37:25 -0700", "a18fac5eaf42aed07c80b09eafc35d9b515a4e2f"],
["2015-10-27 15:36:34 -0700", "eab2bba3cf85b1eb5ecfd28977471bc57ca2bd33"],
["2015-10-27 14:25:47 -0700", "4269fc4054ba4c89da252db1a4cec40905407de6"],
["2015-10-27 16:25:12 -0400", "b57fe09b547dd6f9caf84b650c5079fa0ad8f630"],
["2015-10-26 17:22:08 -0700", "73dec9dc530d65a8c873a21bb4eb3f002c1b7155"],
["2015-10-26 23:14:24 +0100", "9c1a3bd7928c35f8ea07d8c2887f3a9ff03d7020"],
["2015-10-26 13:04:05 -0700", "1afb8e619087d25aea41c29f8737e5d7ce0b2ca1"],
["2015-10-26 12:59:15 -0700", "bb8703feca605772a9a9833284b0fb2eadcda1e2"],
["2015-10-26 12:50:56 -0700", "2d1ed20db778e8f69f66ba76b351b9322fd38495"],
["2015-10-26 12:49:22 -0700", "4f875fe96dcbd5e6363dd3d5b510cd5109199f5b"],
["2015-10-26 12:46:05 -0700", "9a2162e74b4c4ffd128924993ad0cfc467011fc4"],
["2015-10-26 12:42:31 -0700", "26532a98be5cbe8c2c788a6e08463d077f882670"],
["2015-10-26 12:39:33 -0700", "95bd9b424e6339217f95526f622690d115fa2b19"],
["2015-10-26 12:36:22 -0700", "81e93490627e1c92bf9c3e21bff808c8fab80bc7"],
["2015-10-26 12:33:23 -0700", "761e3fad1d3a0eafd0e03a24b48fe6b6b9baf3b9"],
["2015-10-26 12:29:42 -0700", "2be6968715946a4763f6ca8633e311ab7ce63577"],
["2015-10-26 12:23:48 -0700", "2599789533884e37aaab9d9e2c1f9ba900c02704"],
["2015-10-26 12:22:44 -0700", "630cc57b097fcb1a3ed41ca4c9fd92f3c8d0990d"],
["2015-10-26 12:14:15 -0700", "fd23a3daac66af700baf52cf8161b24b9f49deed"],
["2015-10-26 12:10:48 -0700", "622b6c89b27cd6d47791c3081a9a0e8e64fd9ddc"],
["2015-10-26 11:57:12 -0700", "2c1fff2360613317610ba649bada88892d207685"],
["2015-10-26 11:54:41 -0700", "c5cc31c6de56dca2042d50509c0a2ada0b0f01a9"],
["2015-10-26 11:50:03 -0700", "fe2d3ee4639ab09687d56b248c4b2e7aa1a7805e"],
["2015-10-26 11:47:11 -0700", "d51e00b8130249394420e16ef38f69230b306d38"],
["2015-10-26 11:42:51 -0700", "280f3bcd9e37f35ba54af81023f4ce70850bea6f"],
["2015-10-26 11:40:51 -0700", "2951d6e3bc81b42b059fa0f44ce29b9338139417"],
["2015-10-26 11:38:56 -0700", "2241be90d962621c1263919cd0249cce97b8c981"],
["2015-10-23 14:20:06 -0700", "8f07b7403c37619219ddd62109d882767f03db8f"],
["2015-10-23 13:59:23 -0700", "00dee3664e1045af47010e7cc2a6c86cc7635b2f"],
["2015-10-23 13:50:55 -0700", "81df9e2e89a18c4fab19a5d2e7dbd738cd5bc502"],
["2015-10-23 13:20:36 -0700", "efdac8d7f3b4775af9dd26b82832668629824cad"],
["2015-10-23 13:08:10 -0700", "f19635ee64e9a54f4f05a2212b9cb382c87e7f82"],
["2015-10-23 12:29:38 -0700", "f3533c481ebe722b1b8146552b1b1a0a0f98d974"],
["2015-10-23 12:10:31 -0700", "f469b0cb6162cf06524a09ef7e768a5ecd2e5db4"],
["2015-10-22 15:24:00 -0700", "43f93ce6c95ca98f9dffbf4c9d4dc0229b548035"],
["2015-10-21 16:05:57 -0700", "c653019f9cdf9217fd3cb4f3a155d0249e5e4a5d"],
["2015-10-21 15:16:18 -0700", "1181a40569c59b1363058b128120f9ab6d801b39"],
["2015-10-21 13:21:41 -0700", "55650cf887c90cdc62f5087809f2681f3a643728"],
["2015-10-21 13:17:36 -0700", "ecd34c8d6710837422b923566603c58e61182902"],
["2015-10-21 13:15:07 -0700", "b8ac48fd52a72cacdcb6d04b418eb4040f60cbf3"],
["2015-10-19 16:36:29 -0700", "2a662c2ef8257925cd5c1d5e589a0c7ea3312b6c"],
["2015-10-19 14:39:11 -0700", "fd69c7f759295a08dee94281f961fc58496a33e4"],
["2015-10-19 14:24:19 -0700", "0b8eeb3e09dfe5d92acaf427b51384844b743a1c"],
["2015-10-16 16:44:56 -0700", "3a3a183d25212ed5a1e05c0b3da9fe7b0d6cf98d"],
["2015-10-16 16:13:40 -0700", "8582e812cd7f6d4aa15890e2a65800fe4785e8c7"],
["2015-10-16 15:41:57 -0700", "d22c1e5d41d285ea6c97e3a5b68fa5c1aee1eea8"],
["2015-10-16 10:06:35 -0700", "0e7b7cabe8c723543cbfe437b9e03a34dad5f1d8"],
["2015-10-15 21:43:35 -0700", "231142abc9db21644bbc5d093cf756a461b42b57"],
["2015-10-15 14:38:52 -0700", "bfe9e11282b40987aa10b7409aed860aa350f8bd"],
["2015-10-15 14:37:22 -0700", "a3ced3c34291f4703fa229809c06bdf31a44b169"],
["2015-10-14 17:39:17 -0700", "92dd5c5a278de896ae17fa93600278a920e9bb6b"],
["2015-10-14 15:37:34 -0700", "ff8629d27b3dd8955f970408298a79e864416263"],
["2015-10-13 19:25:26 -0700", "e1a5c4014bc0d51e392a010318bc2697487a1a39"],
["2015-10-13 16:34:34 -0700", "eb84feeb87e20865178af81ea575fa801c740212"],
["2015-10-13 16:34:14 -0700", "9c1c307d0f68276509a49292fb818b9a479e2561"],
["2015-10-05 16:45:32 -0700", "2e4aaa36a619d4ac24cfa296a40fb25284e12db9"],
["2015-10-05 16:26:08 -0700", "8d49443a881c97c00e5e9ac591f4622a17799da7"],
["2015-10-05 13:25:34 -0700", "a9350985dea0a6270a2339da01621435ef7faa77"],
["2015-10-04 00:50:48 -0700", "a69f49169cc84bb08295c4b522822d33a7f069df"],
["2015-10-04 00:50:08 -0700", "8480b3ba0ade9d8e83bdf8159c157480c1a9ded0"],
["2015-10-04 00:10:10 -0700", "eeb9a8009a3a3fb2a79b204c89b762ac107c42ed"],
["2015-10-04 00:09:31 -0700", "f047c380e1cb2d8649e5f7893f128c270ef8bb8f"],
["2015-10-04 00:08:42 -0700", "7198d2d861c9a4739f85e4d6dad5d9abad4c9220"],
["2015-10-04 00:07:34 -0700", "610e6b1989b33920ab533580a67c827b88bc37bc"],
["2015-10-04 00:06:47 -0700", "a7699d8b83df3ca49e56cd0dfbf409e42508ae9a"],
["2015-10-04 00:06:03 -0700", "57f1f9de9c45a905e6fac5273c07aed26d044109"],
["2015-10-04 00:05:26 -0700", "00f3ee23ed1646f053cfa6c7d59ad926f0486a6f"],
["2015-10-04 00:00:51 -0700", "7b00b773dcbe27064937939c94768136cf402cc1"],
["2015-10-04 00:00:20 -0700", "b4ea8427d4e9c4f995e5df448a5f79ed6b132bb9"],
["2015-10-04 10:27:53 -0700", "3de47db78f3f0582ebd7c83e40a142d72987f913"],
["2015-10-04 09:54:01 -0700", "16cf5b4af21d31f27fd353ca03eab31369260571"],
["2015-10-03 14:35:12 -0700", "7f189d03d4d932e7acc63ec3b46b340bc4fdabc3"],
["2015-10-03 14:30:05 -0700", "c1442c44b12eb5320236ecde08d653cf0363030a"],
["2015-10-03 11:49:31 -0700", "32ce203ba52dbc3bb5893cca0976ab539d7171ea"],
["2015-10-02 15:17:13 -0400", "8bfc0fcec97f420fced9f653eef6b67e62b5a12a"],
["2015-10-01 15:49:51 -0700", "c836e4eb36efbc1eb665948db3c71a04a3716319"],
["2015-10-01 15:30:15 -0700", "090e736439a14166bfa2eab2e9f9d94071ec7e94"],
["2015-10-01 11:29:52 -0700", "3ee5297fd7c1695491287ad6266a64a584d07a82"],
["2015-10-01 11:28:09 -0700", "e8bc7b8b7ca64f4e386d7fe075bef9281a23ef54"],
["2015-10-01 11:27:27 -0700", "21d378c587a6a0e0495a5faa9013a2b0ff0dd70f"],
["2015-09-30 17:13:40 -0700", "c67ddae4512c1836567679dd6778bdedbfeee84d"],
["2015-09-30 17:11:29 -0700", "98f3352971594887913d699b0fffdad3707a6ddd"],
["2015-09-26 08:26:34 -0700", "5955157cd7f9671343fc2bb484c666cb21afebf1"],
["2015-09-22 11:09:02 -0700", "2025ee08cc8adf2310f6980a54f6f04a51f2fad9"],
["2015-09-23 19:17:04 -0700", "82e7ffd81cf9d58deb5895ea64b889a75428d275"],
["2015-09-23 19:16:53 -0700", "e3d1837bcdb6dffb86c2b11da56244f00a29cb3d"],
["2015-09-23 16:38:44 -0700", "09f561d7175f85943539517f3b36025d0fffcd47"],
["2015-09-23 16:27:53 -0700", "e63529fff48aa744d918e3d57e7611496d00912e"],
["2015-09-23 16:24:45 -0700", "06f07554fd9d23bc7cc7fcf10c3815a8bd29bd15"],
["2015-09-23 16:23:57 -0700", "2499b3fb1a9b30784a79b2328876be1708feadc8"],
["2015-09-23 14:53:56 -0700", "2fa3ca4bbc8e9feece0cce363b076a1942e8c6ba"],
["2015-09-23 13:40:14 -0700", "639d9660456e2e55b43ad1126341bc96acf4b7e3"],
["2015-09-23 13:19:03 -0700", "f4eb54c74ac41b507b94852b6389c8b3171acd2c"],
["2015-09-23 13:13:59 -0700", "0d979f8ef587817920e2f357a956a053292e1182"],
["2015-09-23 12:01:01 -0700", "ea769e238b903cfed97cdf3cabb9d6c9e740e7b3"],
["2015-09-23 12:00:30 -0700", "f852bcb1422190a301b258e6aa8e8b7557f697b2"],
["2015-09-23 10:59:35 -0700", "f47f92cb67149586c1dfb919d2e1381ed9e0e426"],
["2015-09-23 10:56:31 -0700", "faf63da0a4f63e1d9ce7d5043604f0273412be8e"],
["2015-09-23 10:48:46 -0700", "ccba2e877900655e122d8e79b7de571993f1839a"],
["2015-09-22 16:09:48 -0700", "3b2fcbee88be5aacaea2b001ee78c3de19406334"],
["2015-09-22 16:08:01 -0700", "f0f337bb9403e06397e8616c92f794cbf987de10"],
["2015-09-22 10:21:57 -0700", "7461eea82908b2c5742e4d6e5f57dc0cd4b43a60"],
["2015-09-15 13:16:19 -0700", "0e3a7d87c9a37fbdf51bb787842e3d699b61147b"],
["2015-09-15 15:28:11 -0400", "aa65fbe09783b7273184b0bb05d07a5a516d7013"],
["2015-09-15 15:06:36 -0400", "7eb1b7ad8ae6d01720f09ed63db05fdfcf57ebe7"],
["2015-08-28 14:20:05 -0700", "b97a737cfa990f744acd9aa18a829d8b5fa7c3e4"],
["2015-08-18 17:56:28 -0700", "d66e77c869ea10bfdb4378e9bd913c8c7c7dbc94"],
["2015-08-18 12:25:30 -0700", "5170d0dbc114ce35c3dcdf24c6f0c4e3df401428"],
["2015-08-18 12:18:18 -0700", "c4a04e1c6015a2634877558d2215847403127336"],
["2015-08-18 15:34:39 +0200", "cdf5865b7da09cce276581f134349e24d2b6c199"],
["2015-07-31 17:42:17 -0400", "16ef4b6512bd5a975bb8dce882279212e14ebe1e"],
["2015-07-30 15:20:13 -0700", "6f35ca7aa0415e3992af304987380b1f5cbab191"],
["2015-07-30 15:19:35 -0700", "c75a05ec4e0138f9622497bb1d0d0019d27ea7ab"],
["2015-07-30 15:18:27 -0700", "275006e4521f528d0ce6a61ffd55ad6bbcca6c8b"],
["2015-07-30 10:37:30 -0700", "254f79a216f576570c9deb75eeedab344b298d32"],
["2015-07-30 10:37:24 -0700", "4b7819430358be4aac21e1bff7efa892d7dc59bd"],
["2015-07-30 10:37:17 -0700", "f5a5abb1fb6012eb38c9b9df9a38048979729325"],
["2015-07-30 08:50:58 -0700", "881e618e5932ad82884a00272a5e66431144b2cf"],
["2015-07-29 23:02:13 -0700", "2fb3c844a6affcfa42035646dafeecc14381bce6"],
["2015-07-29 00:35:06 -0700", "91ed7d006f262d09c0c8429b8f887cb871ca5223"],
["2015-07-16 10:07:31 -0700", "01af952129efb0fd22746d4a85566f767f146866"],
["2015-07-13 12:41:16 -0700", "034d11ce5fab89d4f99376e6d40d5ceb63514386"],
["2015-07-02 15:22:02 +0900", "52a9501b3acfb31e94379491c3236694e1947b4d"],
["2015-06-16 18:41:45 -0400", "ae17e59de2e594eec215f1fbbc903e799692bccc"],
["2015-06-16 16:03:01 -0400", "3e8abf0bbfee9e5334954540b4ec40a1a4e8cffc"],
["2015-06-16 12:24:49 -0400", "fd63ef4a02b6dab0256999d4b27cd64149255264"],
["2015-06-15 19:29:28 -0400", "3626e76db2c9fac7b5914d84d6ce45b5b1c14b46"],
["2015-06-09 14:44:16 -0400", "a6e6bab2934a75dfa279df8852b4bfe3a1bb5b86"],
["2015-05-29 14:56:01 -0700", "c87d1f5b65067865bab3e1ac81b6d35e2553b515"],
["2015-05-28 14:04:04 -0700", "2bcc54fba793c5539f1aba8e88c9e6638efc9f0b"],
["2015-05-28 13:05:14 -0700", "4d65b9594146fcaac4132f56ace41688822ae6a0"],
["2015-05-28 09:02:07 -0700", "e2ffd8f30bb35fb8040ee8941e3af650846f7b50"],
["2015-05-27 16:40:53 -0700", "b7d01876c19751e4c75d9910ce4fb2e0d1dc45fa"],
["2015-05-27 16:35:05 -0700", "cc46cc38b9374d13f958cc6992daaec73d5fbecd"],
["2015-05-27 11:01:11 -0700", "c76165d123df2af7c7e1adb7ddb1f2b21bd2a193"],
["2015-05-27 10:59:45 -0700", "fb01b22acf8ba82cc18fe61824158b69eb009f4f"],
["2015-05-13 14:11:12 -0700", "44c2d2a89891ee7c2098e9a11ef8cc8dc8917c7c"],
["2015-05-13 14:05:49 -0700", "dc28c95f7e1ff567eaf17f5ec755ed9de6c42619"],
["2015-05-13 13:54:38 -0700", "05750a917e51c6d164f882297ec5151aa964aedf"],
["2015-04-14 09:13:24 -0700", "effd6992d092e213425dc23691c02d1a814f2b89"],
["2015-04-14 00:42:30 -0400", "9d98a25e3a8c06be3297cb82086b28a891681122"],
["2015-04-08 17:15:57 -0400", "d0d78dfe9e11d3fd16813e745cae6d82b7680cb9"],
["2015-04-08 17:14:03 -0400", "3cd100a2e7116cff20ff6cc7c11038d53e6d445e"],
["2015-04-08 17:13:49 -0400", "14f988a3c66c02daeceb8d379a48f80e654c0cb4"],
["2015-04-08 17:13:00 -0400", "f09fa1789ee5ded2d5712ac53e9c9cebe4aa4f56"],
["2015-03-29 23:51:34 -0400", "6866ed00fd7a937d2f57eb3cb1e6c9467a9b8221"],
["2015-03-29 12:58:58 -0700", "36e1b401e672eb1ba68ca52efa901a4eabf12198"],
["2015-03-29 09:57:40 -0700", "6b027b4a6e7aa7398bb0596b003cf0622c589ee1"],
["2015-03-29 09:57:18 -0700", "7a89919808d8f57fb1080f323cee4b02468bb7d1"],
["2015-03-29 09:57:09 -0700", "1ea3c6e3cfdf231177c391ebcc29574cdf070fc7"],
["2015-03-29 09:56:56 -0700", "dc056ab65d97d8e25e45d9d62f34634efba5e213"],
["2015-03-29 09:56:15 -0700", "37eb6c0c59feb5d48d19b4df73c3ad9a9329dca4"],
["2015-03-25 15:45:09 +0100", "4cc57234c67e394ecb5e443f8076eccdfa462087"],
["2015-03-25 15:44:16 +0100", "0b6a518554331f76eb9e650559255647a0df01c6"],
["2015-03-25 15:40:01 +0100", "45c3dfdabee83ce413696d262b4256a853f9b965"],
["2015-03-24 16:05:36 +0100", "b13cbd84a2a1c3e5648f25b31ae4ae0a53816baf"],
["2015-03-24 15:30:11 +0100", "cdd351a5f5abb67f276c41955103f241c18a50f5"],
["2015-03-15 22:17:24 -0700", "02e857ff8f76b6485d3dcdd2e4a5aa7ef854b05c"],
["2015-03-03 12:36:34 -0800", "ade4a736f1eae72a3f54640f9f5e330301606778"],
["2015-02-24 09:26:30 -0500", "b3ceef1c99df1f3846775406f5f08a7ca5b5aa24"],
["2015-02-24 09:24:01 -0500", "d0e96b14477ff0fe9f721ffd94783ee09e63394c"],
["2015-02-24 10:16:58 +0100", "2cc3aca5b93232b791fe38717260867f733bf038"],
["2015-02-23 23:17:41 +0100", "3d75f8fd5dfe7da24d4344a582cb75c17bee4613"],
["2015-01-26 10:21:38 -0800", "f0b21413957e385fe590b8f82f331dabeae6331f"],
["2015-01-22 17:52:58 -0500", "a052d241e891fe34993ff3775bbdd45d1dc91318"],
["2015-01-13 09:00:59 -0800", "83d11493e8c8bed337af1ccc58b53af0813c11cf"],
["2015-01-09 09:09:14 -0800", "7609b3d533cd5b0fc9efd251c01c8d1b2f63cb7f"],
["2015-01-07 18:24:46 -0800", "c49a3c4ff0220d54dc775f08f84c9f67fcbc8786"],
["2015-01-07 18:18:08 -0800", "e482b39905cd741714b5590a01eac02ccf037db4"],
["2015-01-07 17:03:38 -0800", "14b704d35320d81ad393c77e381da59ddba23374"],
["2015-01-07 14:22:11 -0800", "1c498ff47a7bd1339bd20e3fc183561dc75b0586"],
["2015-01-07 23:10:30 +0100", "17f204c298de63e6514f21a450bdca20f4603597"],
["2015-01-07 12:52:13 -0800", "7394ccff03ea59cfd193e30d29cbaaf05bed31a7"],
["2014-11-20 14:38:31 -0800", "37928bbd338a8e7b91774325a2b7057fffb9eddc"],
["2014-11-20 14:38:04 -0800", "e3fd5e6f819b526fd2a2612dbed6ad12330a3450"],
["2014-11-20 14:33:01 -0800", "48c426ff5dc2ac4753866a0a5aa0ea6b36238dd1"],
["2014-11-20 14:32:10 -0800", "bc11d54643b9ade6bd350be99df05e5e4150e991"],
["2014-11-20 14:30:29 -0800", "eb3c52f11aa7de4d1c75703bd91add3260a8e8da"],
["2014-11-20 14:30:26 -0800", "1325547af239791e876be1cb76cd383d2949d54a"],
["2014-11-20 14:29:07 -0800", "7e8412bb80a9879a8501e134c0ab8cc676264e44"],
["2014-10-04 21:34:43 +0400", "95e346ec3f7c648ca16bd18d15369bd5ce53800a"],
["2014-10-02 12:25:19 -0700", "baa6ca3795aaba95280fc995f911f916f5e76688"],
["2014-09-25 01:48:16 +0400", "c1eee8d5c2649ad5abe078928440d629ac320c5f"],
["2014-09-24 17:48:02 -0400", "c2b2441599ec341cb856eddbd0a30475f9b0b2b2"],
["2014-09-24 17:40:35 -0400", "1af3d1e7c24343e6c30bd60bd8b7b0c69ce8bd01"],
["2014-09-24 17:32:11 -0400", "9e95ed8d527746d12996837ab37e31fe53984507"],
["2014-09-20 09:27:52 -0700", "834c3f770663c05206ebdfd88a2554caeb0f4985"],
["2014-08-20 15:38:43 -0700", "55d4005e1dedfb9704a48d6f166b4bd799df068a"],
["2014-08-20 12:00:06 -0700", "18026413636e4bc93800943ac2dd41ed4a6cd8fc"],
["2014-08-19 08:47:32 -0700", "f11469748a95205a1ec13894039461a53c6d748e"],
["2014-08-19 08:45:53 -0700", "ef2ccff7ad6f0bd7296956e57e54611994395178"],
["2014-08-18 16:01:06 -0700", "22bf1d8fee565bc0d47b69753db7e7ae44d19031"],
["2014-08-18 18:17:43 -0400", "e1a711bedfd0f7f594d6bcd3c946a6e221589738"],
["2014-08-03 22:23:52 -0400", "840eb0f19f2c4d9d238e2442a456eac2e719dea8"],
["2014-07-30 00:34:39 -0700", "43ad919eef0037407c0b9db41968df61ed52cd07"],
["2014-07-30 00:25:09 -0700", "a23eb3e10372e8ace91cd54d1da390d340a8d532"],
["2014-06-06 15:42:54 -0700", "5eb2859a44e8ff5b97c51a01f720a14c7c59733c"],
["2014-06-04 17:20:02 -0700", "7598c92cb522ec358d8fb2cd49de2dd04fc50927"],
["2014-05-15 09:30:11 -0700", "2b1db8c70c3647c91510d89ffac7d510b3d05ef1"],
["2014-05-15 09:21:46 -0700", "3113bdbb8abb588107f8df494d9fb197fafcb71f"],
["2014-05-08 20:07:52 -0400", "ffaaa9624f5664f38c5e12ab3fc307751f031e06"],
["2014-05-07 12:13:34 -0400", "223ccfc1293626dff1b1b37b82815e7cc838063c"],
["2014-05-07 09:10:04 -0700", "d68db65a8e76b3a635165fa8408663ee575aaca2"],
["2014-04-25 13:09:41 -0700", "d0892b38299c67bf9d7587ce08683cfef508b4fd"],
["2014-04-25 11:50:30 -0700", "8bffedc89b9441afb5ae8a8077672242522701ad"],
["2014-04-09 14:50:15 -0700", "4ccfabb5ed76836d9cfad7620563390a1bc21a4f"],
["2014-04-09 14:45:41 -0700", "916684b3f76a9a5f9e19e04b848d696221b91a71"],
["2014-04-09 14:44:09 -0700", "b979295a799d6c51ea6af2dce358d262aca96a93"],
["2014-04-09 14:39:03 -0700", "8e728cef9f23d7e20f8cb8d586dd857dd489fe9f"],
["2014-04-09 14:35:21 -0700", "b63209905850e92a637f367ecbab3aaa6ab80167"],
["2014-04-09 14:33:23 -0700", "befa200b134a6301a5879a6e83797f4d9a2b66f4"],
["2014-04-09 13:40:32 -0700", "cf8bb191ab96029b9a313e97096dc37d55e534d5"],
["2014-04-09 12:07:20 -0700", "ca8825c627ae2c1f08b72d64b1fd370c1f519b3d"],
["2014-04-09 12:04:33 -0700", "11db17a21add028b8d12930a8b047af1df2d3194"],
*/
];
