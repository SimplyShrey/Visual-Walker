using System.Security.Cryptography;
using System.Text;

namespace WebApplication1.Services
{
    public class FileEncryptionService
    {
        private readonly byte[] _key;
        private readonly byte[] _iv;

        public FileEncryptionService(IConfiguration configuration)
        {
            // Use a fixed key for AES encryption (no password required)
            var keyString = "YourFixedEncryptionKey1234567890123456"; // 32 bytes for AES-256
            var ivString = "YourFixedIV123456"; // 16 bytes for AES

            _key = Encoding.UTF8.GetBytes(keyString);
            _iv = Encoding.UTF8.GetBytes(ivString);
        }

        public async Task<byte[]> EncryptAsync(byte[] data)
        {
            using var aes = Aes.Create();
            aes.Key = _key;
            aes.IV = _iv;

            using var encryptor = aes.CreateEncryptor();
            using var ms = new MemoryStream();
            using var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write);

            await cs.WriteAsync(data, 0, data.Length);
            cs.Close();

            return ms.ToArray();
        }

        public async Task<byte[]> DecryptAsync(byte[] encryptedData)
        {
            using var aes = Aes.Create();
            aes.Key = _key;
            aes.IV = _iv;

            using var decryptor = aes.CreateDecryptor();
            using var ms = new MemoryStream(encryptedData);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var resultStream = new MemoryStream();

            await cs.CopyToAsync(resultStream);
            return resultStream.ToArray();
        }

        public async Task EncryptFileAsync(string filePath)
        {
            var data = await File.ReadAllBytesAsync(filePath);
            var encryptedData = await EncryptAsync(data);
            await File.WriteAllBytesAsync(filePath, encryptedData);
        }

        public async Task DecryptFileAsync(string filePath)
        {
            var encryptedData = await File.ReadAllBytesAsync(filePath);
            var decryptedData = await DecryptAsync(encryptedData);
            await File.WriteAllBytesAsync(filePath, decryptedData);
        }

        public async Task<byte[]> DecryptFileToBytesAsync(string filePath)
        {
            var encryptedData = await File.ReadAllBytesAsync(filePath);
            return await DecryptAsync(encryptedData);
        }
    }
}