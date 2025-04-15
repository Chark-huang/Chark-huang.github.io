# Cyclic Redundancy Check - 循环冗余校验


## 1. 简述

### 1.1 是什么
循环冗余校验（英语：Cyclic redundancy check，通称“CRC”）
- 是一种**根据**网上数据包或计算机文件等**数据产生简短固定位数校验码**的**一种散列函数**
- 或是一种**通过数学计算生成「数据指纹」的校验技术**，用于快速检测数据传输或存储中的错误。

### 1.2 经典应用场景
- 网络传输
   - 以太网帧校验（CRC-32）
   - Wi-Fi数据传输（CRC-CCITT）
- 存储介质
  - ZIP/RAR压缩包校验（CRC-32）
- 嵌入式系统
  - 工业传感器数据传输
  - 汽车CAN总线通信

例：当您用U盘拷贝文件时，控制器会在写入时生成CRC码，读取时自动验证，若校验失败则触发「文件损坏」提示。

## 2. 原理介绍
### 2.1 核心思想
提前约定一个「除数」，发送方通过「求余运算」，「生成余数」，并「传输余数」给接收方进行运算校验，「对比余数」是否一致。

### 2.2 简易类比算法步骤 
发送方操作：
▷ 原始数据：12元
▷ 补零扩展：120元（补1个零=校验数位数-1）
▷ 计算校验码：120 ÷7 → 余1
▷ 最终数据：120 +1 =121元（数据+校验码）

接收方验证：
▷ 收到121元 → 121 ÷7 → 余0
▷ 去除末尾校验位：121 去除末尾1 = 12元
▷ 若数据被篡改为122元 → 122 ÷7 → 余3（触发警报）

### 2.3 CRC算法流程
#### 计算数据
原始数据：0x11（二进制为：00010001） 
多项式（CRC-8）：x8+x5+x4+1（二进制为：100110001）

#### 计算步骤
发送方：
1. 原始数据补充8个0：00010001 0000000
   - 在原始数据末尾补n个0（n=生成多项式阶数）
2. 先用高9位（多项式的位数），进行异或计算，0无需处理
   - 即 1 0001 0000 XOR 1 0011 0001 （异或结果，高位为0，不进行XOR，遇到1进行XOR）
   - 
3. 循环XOR 最终得到校验码（结果）：111 0010
4. 数据补全：原始数据 + 校验码 = 0001 0001 0111 0010
   
校验方：
1. 获取数据：0001 0001 0111 0010
2. 数据 XOR 多项式：0001 0001 0111 0010 XOR 1 0011 0001
3. 最终结果：0000 0000 0000 0000
   - 若结果为0，则表示数据未被篡改，否则表示数据被篡改

#### 代码实现
``` go
package main

import (
	"fmt"
	"math/bits"
)

// CalculateCRC 计算带CRC校验码的完整数据包
// 参数:
//
//	data       - 原始数据（按高位对齐的二进制数据）
//	polynomial - 生成多项式（必须包含最高位的1，例如CRC-8用0x131表示x⁸+x⁵+x⁴+1）
//
// 返回值:
//
//	uint - 包含CRC校验码的完整数据包（原始数据 | CRC校验码）
func CalculateCRC(data uint, polynomial uint) uint {
	// 步骤1：确定多项式阶数（校验码长度）
	// 例：0x131(二进制100110001)对应8阶多项式
	degree := bits.Len(polynomial) - 1
	fmt.Printf("[DEBUG] 多项式阶数: %d (校验码位数)\n", degree)

	// 步骤2：数据末尾补零（补零数量=degree）
	// 例：data=0x11(00010001)补8位 → 0x1100
	dividend := data << degree
	fmt.Printf("[DEBUG] 补零后的数据: 0b%b\n", dividend)

	// 步骤3：执行模2除法获取校验码
	remainder := mod2Divide(dividend, polynomial)
	fmt.Printf("[DEBUG] 计算得到的余数: 0b%0*b\n", degree, remainder)

	// 步骤4：合并原始数据和校验码
	// 例：0x1100 | 0x1A → 0x111A
	return dividend | remainder
}

// mod2Divide 模2除法核心实现（异或版）
// 参数:
//
//	dividend - 被除数（已补零的原始数据）
//	divisor  - 除数（生成多项式）
//
// 返回值:
//
//	uint - 余数（即CRC校验码）
func mod2Divide(dividend, divisor uint) uint {
	// 技术说明：通过不断消除最高位的1来计算余数
	divisorLen := bits.Len(divisor)
	fmt.Printf("[DEBUG] 开始模2除法计算，除数位宽: %d\n", divisorLen)

	for {
		currentLen := bits.Len(dividend)
		if currentLen < divisorLen {
			fmt.Printf("[DEBUG] 余数最终值: 0b%b\n", dividend)
			return dividend
		}

		// 计算需要移位的位数（对齐最高位的1）
		shift := currentLen - divisorLen
		fmt.Printf("[DEBUG] 当前被除数: 0b%b (位宽%d)\n", dividend, currentLen)
		fmt.Printf("[DEBUG] 对齐操作：将除数左移%d位 → 0b%b\n", shift, divisor<<shift)

		// 通过异或消除当前最高位
		dividend ^= divisor << shift
		fmt.Printf("[DEBUG] 异或结果 → 0b%b\n", dividend)
	}
}

// ValidateCRC 验证数据完整性
// 参数:
//
//	crcData    - 包含CRC校验码的完整数据包
//	polynomial - 生成多项式（需与生成时一致）
//
// 返回值:
//
//	bool - true表示数据完整，false表示数据损坏
func ValidateCRC(crcData uint, polynomial uint) bool {
	// 技术说明：有效数据应能被多项式整除（余数为0）
	remainder := mod2Divide(crcData, polynomial)
	fmt.Printf("[DEBUG] 验证阶段余数: 0b%b\n", remainder)
	return remainder == 0
}

func main() {
	/* CRC-8示例（多项式x⁸+x⁵+x⁴+1 → 0x131）
	 * 原始数据：0x11（二进制00010001）
	 * 预期结果：
	 *   - 补零后：0x1100
	 *   - 计算余数：0x1A
	 *   - 完整数据包：0x111A
	 */
	const (
		testData       = 0x11
		testPolynomial = 0x131 // 注意：标准CRC-8通常用0x107，此处保持示例原参数
	)

	// 生成含CRC的数据包
	crc := CalculateCRC(testData, testPolynomial)
	fmt.Printf("\n计算结果：\n原始数据: 0x%X\n完整数据包: 0x%X (包含CRC) 0b%b (包含CRC)\n", testData, crc, crc)

	// 验证正常数据
	fmt.Println("\n[验证正常数据]")
	validRes := ValidateCRC(crc, testPolynomial)
	fmt.Printf("校验结果: %t\n", validRes)

	// 模拟数据篡改（修改最后4位）
	corrupted := crc ^ 0xF
	fmt.Printf("\n[篡改数据测试] 修改后数据包: 0x%X\n", corrupted)
	fmt.Println("校验结果:", ValidateCRC(corrupted, testPolynomial))
}

```

## 3. Web应用系统中的实践
优势：
- 快速检测：CRC算法计算速度快，适合实时数据校验。
- 高效性：CRC校验码长度较短，传输和存储开销小。
- 可靠性：能够有效检测出大部分常见的数据错误，如位翻转、数据丢失等。

### 场景一：资源下载的完整性校验
``` go
package main

import (
	"crypto/md5"
	"fmt"
	"hash/crc64"
	"io"
	"os"
	"time"
)

func GetCrc64EcmaValue(file *os.File) (uint64, error) {
	// 记录开始时间
	startTime := time.Now()
	// 创建 CRC64 哈希对象
	crc64Hasher := crc64.New(crc64.MakeTable(crc64.ECMA))
	// 读取文件并计算 CRC64
	_, err := io.Copy(crc64Hasher, file)
	if err != nil {
		fmt.Printf("读取文件失败: %v\n", err)
		return 0, err
	}
	// 获取计算结果
	crcValue := crc64Hasher.Sum64()
	// 记录结束时间
	endTime := time.Now()
	// 输出结果
	fmt.Printf("文件的 CRC64 值: 0d%d \n", crcValue)
	subTime := endTime.Sub(startTime)
	fmt.Printf("计算耗时: %v\n", subTime)
	return crcValue, nil
}

func GetMd5Value(file *os.File) (string, error) {
	// 记录开始时间
	startTime := time.Now()
	// 创建 MD5 哈希对象
	md5Hasher := md5.New()
	// 读取文件并计算 MD5
	_, err := io.Copy(md5Hasher, file)
	if err != nil {
		fmt.Printf("读取文件失败: %v\n", err)
		return "", err
	}
	// 获取计算结果
	md5Value := md5Hasher.Sum(nil)
	// 记录结束时间
	endTime := time.Now()
	// 输出结果
	fmt.Printf("文件的 MD5 值: %x\n", md5Value)
	subTime := endTime.Sub(startTime)
	fmt.Printf("计算耗时: %v\n", subTime)
	return string(md5Value), nil
}

func main() {
	// 文件路径(自己放在本地go项目下)
	filePath := "example.png"

	// 打开文件
	file, err := os.Open(filePath)
	if err != nil {
		fmt.Printf("无法打开文件: %v\n", err)
		return
	}
	defer file.Close()

	_, _ = GetCrc64EcmaValue(file)
	//_, _ = GetMd5Value(file)
}
```
`总结：经测试，需要自己根据实际业务（文件大小）的需求进行选择CRC32 还是 CRC64 的校验，小文件建议使用CRC32，大文件建议使用CRC64。`


### 其他场景 TODO
- APK下载校验；websocket数据传输有准确性校验；... 